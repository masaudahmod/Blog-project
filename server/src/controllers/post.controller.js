import pool from "../config/db.js";
import { getCache, setCache, deleteCache } from "../config/redis.js";
import { cloudinaryDelete, cloudinaryUpload } from "../service/cloudinary.js";
import { asyncHandler, AppError } from "../middlewares/error.middleware.js";
import { updatePost as updatePostModel, pinPostById, getPinnedPost, unpinAllPosts } from "../models/post.model.js";

const CACHE_TTL = 300; // 5 minutes
const postListKey = (page, filter) => `post:list:${page}:${filter}`;
const postFilterKey = (categoryId, page, filter) => `post:filter:${categoryId}:${page}:${filter}`;
const postIdKey = (id) => `post:id:${id}`;
const postSlugKey = (slug) => `post:slug:${slug}`;
const POST_PINNED_KEY = "post:pinned";
const POST_TRENDING_KEY = "post:trending";

async function invalidatePostListAndFilter(categoryId) {
  await deleteCache(postListKey(1, "all"));
  await deleteCache(postListKey(1, "published"));
  await deleteCache(postListKey(1, "draft"));
  if (categoryId != null) {
    await deleteCache(postFilterKey(categoryId, 1, "all"));
    await deleteCache(postFilterKey(categoryId, 1, "published"));
    await deleteCache(postFilterKey(categoryId, 1, "draft"));
  }
}

export const addPost = asyncHandler(async (req, res) => {
  let {
    title,
    slug,
    content,
    excerpt,
    featured_image_alt,
    featured_image_caption,
    meta_title,
    meta_description,
    meta_keywords,
    canonical_url,
    schema_type,
    category_id,
    tags,
    read_time,
    likes,
    comments,
    interactions,
    is_published,
    published_at,
    updated_at,
  } = req.body;

  // Get author_id from authenticated user
  const author_id = req.user?.id || null;

  const featured_image = req.file;
  let image_upload = {};
  if (featured_image) {
    image_upload = await cloudinaryUpload(
      featured_image?.path,
      title,
      "postFeatureImage"
    );
  }
  if (meta_keywords) {
    meta_keywords = meta_keywords.split(",").map((keyword) => keyword.trim());
  }

  if (tags) {
    tags = tags.split(",").map((tag) => tag.trim());
  }

  if (!slug) {
    slug = title
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");
  }

  if (!title || !content || !category_id) {
    throw new AppError("Missing required fields: title, content, and category_id are required", 400);
  }

  await invalidatePostListAndFilter(parseInt(category_id));
  const result = await pool.query(
    `Insert into posts (title, slug, content, excerpt, featured_image_url, featured_image_public_id, featured_image_alt, featured_image_caption, meta_title, meta_description, meta_keywords, canonical_url, schema_type, category_id, author_id, tags, read_time, likes, comments, interactions, is_published, published_at, updated_at) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23) returning *`,
    [
      title,
      slug,
      content,
      excerpt || null,
      image_upload?.uploadResult?.url || null,
      image_upload?.uploadResult?.public_id || null,
      featured_image_alt || null,
      featured_image_caption || null,

      meta_title,
      meta_description,
      meta_keywords,
      canonical_url,
      schema_type,
      category_id,
      author_id,
      tags,
      read_time,
      likes || 0,
      JSON.stringify(comments || []),
      JSON.stringify(interactions || []),
      is_published || false,
      published_at || null,
      updated_at || null,
    ]
  );
  
  return res
    .status(201)
    .json({ success: true, message: "Post created", post: result.rows[0] });
});

export const allPosts = asyncHandler(async (req, res) => {
  const limit = 10;
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * limit;
  const filter = req.query.filter || "all"; // all, published, draft

  const cacheKey = postListKey(page, filter);
  const cached = await getCache(cacheKey);
  if (cached) {
    return res.status(200).json({ ...cached, source: "cache" });
  }

  let whereClause = "";
  if (filter === "published") {
    whereClause = "WHERE posts.is_published = true";
  } else if (filter === "draft") {
    whereClause = "WHERE posts.is_published = false";
  }

  const query = `
    SELECT 
      posts.*,
      json_build_object(
        'id', categories.id,
        'name', categories.name,
        'slug', categories.slug
      ) AS category,
      json_build_object(
        'id', users.id,
        'name', users.name,
        'email', users.email
      ) AS author,
      COALESCE(comment_counts.total, 0) as comment_count,
      COALESCE(comment_counts.pending, 0) as pending_comment_count
    FROM posts
    LEFT JOIN categories ON posts.category_id = categories.id
    LEFT JOIN users ON posts.author_id = users.id
    LEFT JOIN (
      SELECT 
        post_id,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending
      FROM comments
      GROUP BY post_id
    ) comment_counts ON posts.id = comment_counts.post_id
    ${whereClause}
    ORDER BY posts.created_at DESC
    LIMIT $1 OFFSET $2
  `;

  const params = filter === "all" ? [limit, offset] : [limit, offset];
  const posts = await pool.query(query, params);

  // Get total count with filter
  let countQuery = "SELECT COUNT(*) FROM posts";
  if (filter !== "all") {
    countQuery += filter === "published" ? " WHERE is_published = true" : " WHERE is_published = false";
  }
  const totalResult = await pool.query(countQuery);
  const totalPosts = parseInt(totalResult.rows[0].count);
  const totalPages = Math.ceil(totalPosts / limit);

  const payload = {
    success: true,
    message: "Posts retrieved",
    currentPage: page,
    totalPages,
    posts: posts.rows,
  };
  await setCache(cacheKey, payload, CACHE_TTL);
  res.status(200).json(payload);
});

/**
 * Get trending posts (published, ordered by published_at DESC)
 * Query: limit (default 5, max 10)
 * Returns: id, slug, title, published_at for sidebar / "Trending Now"
 */
export const getTrendingPosts = asyncHandler(async (req, res) => {
  const limit = Math.min(10, Math.max(1, parseInt(req.query.limit) || 5));
  const cacheKey = `${POST_TRENDING_KEY}:${limit}`;
  const cached = await getCache(cacheKey);
  if (cached) {
    return res.status(200).json({ ...cached, source: "cache" });
  }

  const query = `
    SELECT id, slug, title, published_at
    FROM posts
    WHERE is_published = true AND published_at IS NOT NULL
    ORDER BY published_at DESC
    LIMIT $1
  `;
  const result = await pool.query(query, [limit]);
  const payload = {
    success: true,
    message: "Trending posts retrieved",
    posts: result.rows,
  };
  await setCache(cacheKey, payload, CACHE_TTL);
  res.status(200).json(payload);
});

/**
 * Get posts filtered by category with aggregation
 * Supports filtering by category ID or slug
 * Returns paginated posts with category statistics
 * 
 * Query Parameters:
 * - categoryId: Filter by category ID (integer)
 * - categorySlug: Filter by category slug (string)
 * - page: Page number (default: 1)
 * - limit: Posts per page (default: 10, max: 50)
 * - filter: Post status filter - 'all', 'published', 'draft' (default: 'all')
 * - includeStats: Include category statistics (default: false)
 * 
 * Response includes:
 * - posts: Array of filtered posts with category and author info
 * - pagination: Current page, total pages, total posts
 * - categoryStats: (optional) Total post count per category, latest 5 posts per category
 * 
 * Example: GET /api/post/filter?categorySlug=technology&page=1&limit=10&filter=published
 */
export const getPostsByFilter = asyncHandler(async (req, res) => {
  const { categoryId, categorySlug, page = 1, limit = 10, filter = "all", includeStats = "false" } = req.query;

  // Validate pagination parameters
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10));
  const offset = (pageNum - 1) * limitNum;
  const includeStatsFlag = includeStats === "true";

  // Validate filter parameter
  const validFilters = ["all", "published", "draft"];
  const statusFilter = validFilters.includes(filter) ? filter : "all";

  // Validate that at least one category identifier is provided
  if (!categoryId && !categorySlug) {
    throw new AppError("Either categoryId or categorySlug must be provided", 400);
  }

  // First, verify the category exists
  let categoryQuery;
  let categoryParams;

  if (categoryId) {
    categoryQuery = "SELECT id, name, slug FROM categories WHERE id = $1 AND active = TRUE";
    categoryParams = [categoryId];
  } else {
    categoryQuery = "SELECT id, name, slug FROM categories WHERE slug = $1 AND active = TRUE";
    categoryParams = [categorySlug];
  }

  const categoryResult = await pool.query(categoryQuery, categoryParams);

  if (categoryResult.rows.length === 0) {
    throw new AppError("Category not found or inactive", 404);
  }

  const category = categoryResult.rows[0];
  const resolvedCategoryId = category.id;

  const filterCacheKey = postFilterKey(resolvedCategoryId, pageNum, statusFilter);
  const filterCached = await getCache(filterCacheKey);
  if (filterCached) {
    return res.status(200).json({ ...filterCached, source: "cache" });
  }

  // Build WHERE clause for post status filter
  let statusWhereClause = "";
  if (statusFilter === "published") {
    statusWhereClause = "AND posts.is_published = true";
  } else if (statusFilter === "draft") {
    statusWhereClause = "AND posts.is_published = false";
  }

  // Main query: Get filtered posts with category and author info, comment counts
  const postsQuery = `
    SELECT 
      posts.*,
      json_build_object(
        'id', categories.id,
        'name', categories.name,
        'slug', categories.slug
      ) AS category,
      json_build_object(
        'id', users.id,
        'name', users.name,
        'email', users.email
      ) AS author,
      COALESCE(comment_counts.total, 0) as comment_count,
      COALESCE(comment_counts.pending, 0) as pending_comment_count
    FROM posts
    LEFT JOIN categories ON posts.category_id = categories.id
    LEFT JOIN users ON posts.author_id = users.id
    LEFT JOIN (
      SELECT 
        post_id,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending
      FROM comments
      GROUP BY post_id
    ) comment_counts ON posts.id = comment_counts.post_id
    WHERE posts.category_id = $1
    ${statusWhereClause}
    ORDER BY posts.created_at DESC
    LIMIT $2 OFFSET $3
  `;

  const postsParams = [resolvedCategoryId, limitNum, offset];
  const postsResult = await pool.query(postsQuery, postsParams);

  // Get total count for pagination
  const countQuery = `
    SELECT COUNT(*) as total
    FROM posts
    WHERE category_id = $1
    ${statusWhereClause}
  `;
  const countParams = [resolvedCategoryId];
  const countResult = await pool.query(countQuery, countParams);
  const totalPosts = parseInt(countResult.rows[0].total);
  const totalPages = Math.ceil(totalPosts / limitNum);

  // Prepare response
  const response = {
    success: true,
    message: "Posts retrieved successfully",
    category: {
      id: category.id,
      name: category.name,
      slug: category.slug,
    },
    pagination: {
      currentPage: pageNum,
      totalPages,
      totalPosts,
      limit: limitNum,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    },
    posts: postsResult.rows,
  };

  // Optional: Include category statistics (total post count per category, latest 5 posts per category)
  if (includeStatsFlag) {
    // Get total post count per category (all categories with their post counts)
    const categoryStatsQuery = `
      SELECT 
        c.id,
        c.name,
        c.slug,
        COUNT(p.id) as post_count,
        COUNT(p.id) FILTER (WHERE p.is_published = true) as published_count,
        COUNT(p.id) FILTER (WHERE p.is_published = false) as draft_count
      FROM categories c
      LEFT JOIN posts p ON c.id = p.category_id
      WHERE c.active = TRUE
      GROUP BY c.id, c.name, c.slug
      ORDER BY post_count DESC
    `;
    const categoryStatsResult = await pool.query(categoryStatsQuery);

    // Get latest 5 posts per category (for the requested category)
    const latestPostsQuery = `
      SELECT 
        posts.id,
        posts.title,
        posts.slug,
        posts.featured_image_url,
        posts.created_at,
        posts.is_published,
        json_build_object(
          'id', categories.id,
          'name', categories.name,
          'slug', categories.slug
        ) AS category
      FROM posts
      LEFT JOIN categories ON posts.category_id = categories.id
      WHERE posts.category_id = $1
      ${statusWhereClause}
      ORDER BY posts.created_at DESC
      LIMIT 5
    `;
    const latestPostsResult = await pool.query(latestPostsQuery, [resolvedCategoryId]);

    response.categoryStats = {
      allCategories: categoryStatsResult.rows,
      latestPosts: latestPostsResult.rows,
    };
  }

  // Handle empty results
  if (postsResult.rows.length === 0) {
    response.message = `No posts found for category "${category.name}"`;
  }

  await setCache(filterCacheKey, response, CACHE_TTL);
  res.status(200).json(response);
});

export const getPost = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = postIdKey(id);
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.status(200).json({ message: "Post retrieved", post: cached.post, source: "cache" });
    }
    const query = "SELECT * FROM posts WHERE id = $1";
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Post not found" });
    await setCache(cacheKey, { post: result.rows[0] }, CACHE_TTL);
    res.status(200).json({ message: "Post retrieved", post: result.rows[0] });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

export const getPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const cacheKey = postSlugKey(slug);
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.status(200).json({ message: "Post retrieved", post: cached.post, source: "cache" });
    }
    const query = "SELECT * FROM posts WHERE slug = $1";
    const result = await pool.query(query, [slug]);
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Post not found" });
    await setCache(cacheKey, { post: result.rows[0] }, CACHE_TTL);
    res.status(200).json({ message: "Post retrieved", post: result.rows[0] });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const postResult = await pool.query(
      "SELECT featured_image_public_id FROM posts WHERE id = $1",
      [id]
    );

    if (postResult.rows.length === 0)
      return res.status(404).json({ message: "Post not found" });

    const featured_image_public_id =
      postResult.rows[0].featured_image_public_id;

    const slug = postResult.rows[0].slug;
    const category_id = postResult.rows[0].category_id;

    if (featured_image_public_id) {
      await cloudinaryDelete(featured_image_public_id);
    }

    await deleteCache(postIdKey(id));
    await deleteCache(postSlugKey(slug));
    await invalidatePostListAndFilter(category_id);
    await pool.query("DELETE FROM posts WHERE id = $1", [id]);

    res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const updatePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  // Include author_id if user is authenticated
  if (req.user?.id) {
    data.author_id = req.user.id;
  }

  const result = await updatePostModel(id, data);
  if (result.rowCount === 0) {
    throw new AppError("Post not found", 404);
  }

  const post = result.rows[0];
  await deleteCache(postIdKey(id));
  await deleteCache(postSlugKey(post.slug));
  await invalidatePostListAndFilter(post.category_id);

  res.status(200).json({
    success: true,
    message: "Post updated successfully",
    post,
  });
});

/**
 * Update post by slug (handles FormData with file upload)
 * PUT/PATCH /api/post/slug/:slug
 */
export const updatePostBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  // First, get the post by slug to get the ID and existing data
  const postResult = await pool.query("SELECT id, featured_image_url, featured_image_public_id, likes, comments, interactions FROM posts WHERE slug = $1", [slug]);

  if (postResult.rows.length === 0) {
    throw new AppError("Post not found", 404);
  }

  const postId = postResult.rows[0].id;
  const existingImageUrl = postResult.rows[0].featured_image_url;
  const existingPublicId = postResult.rows[0].featured_image_public_id;
  const existingLikes = postResult.rows[0].likes;
  const existingComments = postResult.rows[0].comments;
  const existingInteractions = postResult.rows[0].interactions;

  let {
    title,
    new_slug,
    content,
    featured_image_alt,
    featured_image_caption,
    meta_title,
    meta_description,
    meta_keywords,
    canonical_url,
    schema_type,
    category_id,
    tags,
    read_time,
    is_published,
    published_at,
    remove_image,
  } = req.body;

  // Get author_id from authenticated user (keep existing author_id)
  const author_id = req.user?.id || null;

  const featured_image = req.file;
  let image_upload = {};
  let new_image_url = null;
  let new_image_public_id = null;

  // Handle image upload/replacement
  if (featured_image) {
    // Delete old image if it exists
    if (existingPublicId) {
      await cloudinaryDelete(existingPublicId);
    }

    // Upload new image
    image_upload = await cloudinaryUpload(
      featured_image?.path,
      title || "post",
      "postFeatureImage"
    );
    new_image_url = image_upload?.uploadResult?.url || null;
    new_image_public_id = image_upload?.uploadResult?.public_id || null;
  } else if (remove_image === "true") {
    // Remove image if requested
    if (existingPublicId) {
      await cloudinaryDelete(existingPublicId);
    }
    new_image_url = null;
    new_image_public_id = null;
  } else {
    // Keep existing image
    new_image_url = existingImageUrl;
    new_image_public_id = existingPublicId;
  }

  // Process meta_keywords and tags
  if (meta_keywords) {
    if (typeof meta_keywords === "string") {
      meta_keywords = meta_keywords.split(",").map((keyword) => keyword.trim());
    }
  }

  if (tags) {
    if (typeof tags === "string") {
      tags = tags.split(",").map((tag) => tag.trim());
    }
  }

  // Use new_slug if provided, otherwise keep existing slug
  const finalSlug = new_slug || slug;

  // Validate required fields
  if (!title || !content || !category_id) {
    throw new AppError("Missing required fields: title, content, and category_id are required", 400);
  }

  // Prepare update data
  const updateData = {
    title,
    slug: finalSlug,
    content,
    excerpt: null, // Can be added later if needed
    featured_image_url: new_image_url,
    featured_image_alt: featured_image_alt || null,
    featured_image_caption: featured_image_caption || null,
    meta_title: meta_title || null,
    meta_description: meta_description || null,
    meta_keywords: meta_keywords || null,
    canonical_url: canonical_url || null,
    schema_type: schema_type || "Article",
    category_id: parseInt(category_id),
    author_id: author_id,
    tags: tags || null,
    read_time: read_time ? parseInt(read_time) : 1,
    likes: existingLikes || 0,
    comments: existingComments || [],
    interactions: existingInteractions || [],
    is_published: is_published === "true" || is_published === true,
    published_at: published_at || null,
  };

  // Update the post
  const result = await pool.query(
    `UPDATE posts SET 
      title = $1, slug = $2, content = $3, excerpt = $4,
      featured_image_url = $5, featured_image_public_id = $6, featured_image_alt = $7, featured_image_caption = $8,
      meta_title = $9, meta_description = $10, meta_keywords = $11,
      canonical_url = $12, schema_type = $13,
      category_id = $14, author_id = $15, tags = $16, read_time = $17,
      likes = $18, comments = $19, interactions = $20,
      is_published = $21, published_at = $22,
      updated_at = NOW()
     WHERE id = $23
     RETURNING *`,
    [
      updateData.title,
      updateData.slug,
      updateData.content,
      updateData.excerpt,
      updateData.featured_image_url,
      new_image_public_id,
      updateData.featured_image_alt,
      updateData.featured_image_caption,
      updateData.meta_title,
      updateData.meta_description,
      updateData.meta_keywords,
      updateData.canonical_url,
      updateData.schema_type,
      updateData.category_id,
      updateData.author_id,
      updateData.tags,
      updateData.read_time,
      updateData.likes,
      JSON.stringify(updateData.comments),
      JSON.stringify(updateData.interactions),
      updateData.is_published,
      updateData.published_at,
      postId,
    ]
  );

  if (result.rows.length === 0) {
    throw new AppError("Failed to update post", 500);
  }

  const post = result.rows[0];
  await deleteCache(postIdKey(postId));
  await deleteCache(postSlugKey(finalSlug));
  await invalidatePostListAndFilter(post.category_id);

  return res.status(200).json({
    success: true,
    message: "Post updated successfully",
    post,
  });
});

/**
 * Update publish status of a post
 * PATCH /api/post/:id/publish
 * Body: { is_published: true/false }
 */
export const updatePublishStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { is_published } = req.body;

  if (typeof is_published !== "boolean") {
    throw new AppError("is_published must be a boolean", 400);
  }

  // Check if post exists
  const postCheck = await pool.query("SELECT id FROM posts WHERE id = $1", [id]);
  if (postCheck.rows.length === 0) {
    throw new AppError("Post not found", 404);
  }

  const published_at = is_published ? new Date().toISOString() : null;
  const result = await pool.query(
    `UPDATE posts 
     SET is_published = $1, published_at = $2, updated_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [is_published, published_at, id]
  );

  const post = result.rows[0];
  await deleteCache(postIdKey(id));
  await deleteCache(postSlugKey(post.slug));
  await invalidatePostListAndFilter(post.category_id);

  res.status(200).json({
    success: true,
    message: is_published ? "Post published successfully" : "Post unpublished successfully",
    post,
  });
});

export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { userName, message } = req.body;

    function generateUniqueId() {
      return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }
    console.log(generateUniqueId);

    const newComment = {
      id: generateUniqueId(),
      author: userName,
      message,
      status: "pending",
      created_at: new Date().toISOString(),
    };

    const postResult = await pool.query(
      "SELECT comments FROM posts WHERE id = $1",
      [id]
    );
    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }
    const comments = postResult.rows[0].comments || [];
    comments.push(newComment);
    await pool.query("UPDATE posts SET comments = $1 WHERE id = $2", [
      JSON.stringify(comments),
      id,
    ]);
    res.status(200).json({ message: "Comment added" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server Error in add comment", error: error.message });
  }
};

export const getPendingComments = async (req, res) => {
  try {
    //   const result = await pool.query(`
    //   SELECT id, comments, title
    //   FROM posts
    //   WHERE comments::text LIKE '%pending%'
    // `);
    const query = `
      SELECT 
        id, 
        title, 
        jsonb_path_query_array(comments, '$[*] ? (@.status == "pending")') as pending_comments
      FROM posts
      WHERE comments @> '[{"status": "pending"}]'
    `;

    const result = await pool.query(query);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No pending comments found" });
    }
    res
      .status(200)
      .json({ message: "Pending comments retrieved", comments: result.rows });
  } catch (error) {
    console.error("Error get pending comment:", error);
    res.status(500).json({
      message: "Server Error in get pending comment",
      error: error.message,
    });
  }
};

export const approveComment = async (req, res) => {
  try {
    const { postId, commentId } = req.query;

    const post = await pool.query(`SELECT comments FROM posts WHERE id=$1`, [
      postId,
    ]);

    if (post.rows.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    const updatedComments = post.rows[0].comments.map((comment) =>
      comment.id === commentId ? { ...comment, status: "approved" } : comment
    );

    await pool.query(`UPDATE posts SET comments = $1 WHERE id = $2`, [
      JSON.stringify(updatedComments),
      postId,
    ]);
    res.status(200).json({ message: "Comment approved" });
  } catch (error) {
    console.error("Error approve comment:", error);
    res.status(500).json({
      message: "Server Error in approve comment",
      error: error.message,
    });
  }
};

/**
 * Get monthly stats for a single month: posts, comments (from comments table), likes (from post_likes table)
 * GET /api/post/monthly-stats?month=1&year=2025
 */
export const getMonthlyPost = async (req, res) => {
  try {
    const { month, year } = req.query;
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    if (!m || !y || m < 1 || m > 12) {
      return res.status(400).json({ message: "Valid month (1-12) and year are required" });
    }

    const [postsResult, commentsResult, likesResult] = await Promise.all([
      pool.query(
        `SELECT COUNT(id)::int AS total_posts FROM posts
         WHERE EXTRACT(MONTH FROM created_at) = $1 AND EXTRACT(YEAR FROM created_at) = $2`,
        [m, y]
      ),
      pool.query(
        `SELECT COUNT(id)::int AS total_comments FROM comments
         WHERE EXTRACT(MONTH FROM created_at) = $1 AND EXTRACT(YEAR FROM created_at) = $2`,
        [m, y]
      ),
      pool.query(
        `SELECT COUNT(id)::int AS total_likes FROM post_likes
         WHERE EXTRACT(MONTH FROM created_at) = $1 AND EXTRACT(YEAR FROM created_at) = $2`,
        [m, y]
      ),
    ]);

    const total_posts = postsResult.rows[0]?.total_posts ?? 0;
    const total_comments = commentsResult.rows[0]?.total_comments ?? 0;
    const total_likes = likesResult.rows[0]?.total_likes ?? 0;

    res.status(200).json({
      message: "Monthly stats retrieved",
      data: { total_posts, total_comments, total_likes },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error in get monthly post",
      error: error.message,
    });
  }
};

/**
 * Get daily stats for the last N days (for charts)
 * GET /api/post/daily-stats/history?days=10
 */
export const getDailyStatsHistory = async (req, res) => {
  try {
    const days = Math.min(Math.max(parseInt(req.query.days, 10) || 10, 1), 31);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const postsResult = await pool.query(
      `SELECT DATE(created_at) AS day, COUNT(id)::int AS total_posts
       FROM posts WHERE created_at >= $1
       GROUP BY DATE(created_at) ORDER BY day`,
      [startDate]
    );
    const commentsResult = await pool.query(
      `SELECT DATE(created_at) AS day, COUNT(id)::int AS total_comments
       FROM comments WHERE created_at >= $1
       GROUP BY DATE(created_at) ORDER BY day`,
      [startDate]
    );
    const likesResult = await pool.query(
      `SELECT DATE(created_at) AS day, COUNT(id)::int AS total_likes
       FROM post_likes WHERE created_at >= $1
       GROUP BY DATE(created_at) ORDER BY day`,
      [startDate]
    );

    const byDay = (r, key) => {
      const map = new Map();
      (r.rows || []).forEach((row) => {
        const day = row.day;
        const dayStr = day instanceof Date ? day.toISOString().slice(0, 10) : String(day).slice(0, 10);
        map.set(dayStr, row[key]);
      });
      return map;
    };
    const postsByDay = byDay(postsResult, "total_posts");
    const commentsByDay = byDay(commentsResult, "total_comments");
    const likesByDay = byDay(likesResult, "total_likes");

    const result = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().slice(0, 10);
      result.push({
        date: dateStr,
        posts: postsByDay.get(dateStr) ?? 0,
        comments: commentsByDay.get(dateStr) ?? 0,
        likes: likesByDay.get(dateStr) ?? 0,
      });
    }

    res.status(200).json({
      message: "Daily stats history retrieved",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error in get daily stats history",
      error: error.message,
    });
  }
};

/**
 * Get monthly stats for the last N months (for charts)
 * GET /api/post/monthly-stats/history?months=12
 */
export const getMonthlyStatsHistory = async (req, res) => {
  try {
    const months = Math.min(Math.max(parseInt(req.query.months, 10) || 12, 1), 24);
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const postsResult = await pool.query(
      `SELECT
        EXTRACT(YEAR FROM created_at)::int AS year,
        EXTRACT(MONTH FROM created_at)::int AS month,
        COUNT(id)::int AS total_posts
       FROM posts
       WHERE created_at >= $1
       GROUP BY EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at)
       ORDER BY year, month`,
      [startDate]
    );
    const commentsResult = await pool.query(
      `SELECT
        EXTRACT(YEAR FROM created_at)::int AS year,
        EXTRACT(MONTH FROM created_at)::int AS month,
        COUNT(id)::int AS total_comments
       FROM comments
       WHERE created_at >= $1
       GROUP BY EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at)
       ORDER BY year, month`,
      [startDate]
    );
    const likesResult = await pool.query(
      `SELECT
        EXTRACT(YEAR FROM created_at)::int AS year,
        EXTRACT(MONTH FROM created_at)::int AS month,
        COUNT(id)::int AS total_likes
       FROM post_likes
       WHERE created_at >= $1
       GROUP BY EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at)
       ORDER BY year, month`,
      [startDate]
    );

    const byKey = (r, key) => {
      const map = new Map();
      (r.rows || []).forEach((row) => map.set(`${row.year}-${row.month}`, row[key]));
      return map;
    };
    const postsByMonth = byKey(postsResult, "total_posts");
    const commentsByMonth = byKey(commentsResult, "total_comments");
    const likesByMonth = byKey(likesResult, "total_likes");

    const result = [];
    for (let i = 0; i < months; i++) {
      const d = new Date(startDate);
      d.setMonth(d.getMonth() + i);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const key = `${year}-${month}`;
      result.push({
        date: `${year}-${String(month).padStart(2, "0")}-01`,
        year,
        month,
        posts: postsByMonth.get(key) ?? 0,
        comments: commentsByMonth.get(key) ?? 0,
        likes: likesByMonth.get(key) ?? 0,
      });
    }

    res.status(200).json({
      message: "Monthly stats history retrieved",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error in get monthly stats history",
      error: error.message,
    });
  }
};

export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const postResult = await pool.query(
      "SELECT likes FROM posts WHERE id = $1",
      [id]
    );
    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }
    const likes = postResult.rows[0].likes || 0;
    await pool.query("UPDATE posts SET likes = $1 WHERE id = $2", [
      likes + 1,
      id,
    ]);
    res.status(200).json({ message: "Post liked" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server Error in like post", error: error.message });
  }
};

export const likePostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const result = await pool.query(
      `
      UPDATE posts
      SET likes = likes + 1
      WHERE slug = $1
      RETURNING likes
      `,
      [slug]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({
      likes: result.rows[0].likes,
    });
  } catch (error) {
    res.status(500).json({
      message: "Like failed",
      error: error.message,
    });
  }
};

export const unlikePostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const result = await pool.query(
      `
      UPDATE posts
      SET likes = GREATEST(likes - 1, 0)
      WHERE slug = $1
      RETURNING likes
      `,
      [slug]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({
      likes: result.rows[0].likes,
    });
  } catch (error) {
    res.status(500).json({
      message: "Unlike failed",
      error: error.message,
    });
  }
};

/**
 * Pin a post by ID
 * Automatically unpins all other posts (only one post can be pinned at a time)
 * If the post is already pinned, it will unpin it instead
 * PATCH /api/post/:id/pin
 */
export const pinPostController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const postId = parseInt(id);

  if (isNaN(postId)) {
    throw new AppError("Invalid post ID", 400);
  }

  // Check if post exists and get its current pinned status
  const postCheck = await pool.query("SELECT id, is_pinned FROM posts WHERE id = $1", [postId]);
  if (postCheck.rows.length === 0) {
    throw new AppError("Post not found", 404);
  }

  const isCurrentlyPinned = postCheck.rows[0].is_pinned;

  if (isCurrentlyPinned) {
    await deleteCache(POST_PINNED_KEY);
    const result = await unpinAllPosts();
    return res.status(200).json({
      success: true,
      message: "Post unpinned successfully",
      post: postCheck.rows[0],
    });
  }

  await deleteCache(POST_PINNED_KEY);
  const result = await pinPostById(postId);

  if (result.rows.length === 0) {
    throw new AppError("Failed to pin post", 500);
  }

  res.status(200).json({
    success: true,
    message: "Post pinned successfully",
    post: result.rows[0],
  });
});

/**
 * Get the currently pinned post
 * GET /api/post/pinned
 */
export const getPinnedPostController = asyncHandler(async (req, res) => {
  try {
    const cached = await getCache(POST_PINNED_KEY);
    if (cached) {
      return res.status(200).json({ ...cached, source: "cache" });
    }

    const result = await getPinnedPost();
    if (result.rows.length === 0) {
      const emptyPayload = { success: true, message: "No pinned post found", post: null };
      await setCache(POST_PINNED_KEY, emptyPayload, CACHE_TTL);
      return res.status(200).json(emptyPayload);
    }

    const payload = { success: true, message: "Pinned post retrieved", post: result.rows[0] };
    await setCache(POST_PINNED_KEY, payload, CACHE_TTL);
    res.status(200).json(payload);
  } catch (error) {
    console.error("Error get pinned post:", error);
    res.status(500).json({
      success: false,
      message: "Server Error in get pinned post",
      error: error.message,
    });
  }
});
