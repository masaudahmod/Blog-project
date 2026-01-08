import pool from "../config/db.js";
import { cloudinaryDelete, cloudinaryUpload } from "../service/cloudinary.js";
import { asyncHandler, AppError } from "../middlewares/error.middleware.js";
import { updatePost as updatePostModel } from "../models/post.model.js";

export const addPost = asyncHandler(async (req, res) => {
  let {
    title,
    slug,
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

  const result = await pool.query(
    `Insert into posts (title, slug, content, featured_image_url, featured_image_public_id, featured_image_alt, featured_image_caption, meta_title, meta_description, meta_keywords, canonical_url, schema_type, category_id, author_id, tags, read_time, likes, comments, interactions, is_published, published_at, updated_at) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22) returning *`,
    [
      title,
      slug,
      content,

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

  // Build WHERE clause based on filter
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

  res.status(200).json({
    success: true,
    message: "Posts retrieved",
    currentPage: page,
    totalPages,
    posts: posts.rows,
  });
});

export const getPost = async (req, res) => {
  try {
    const { id } = req.params;
    const query = "SELECT * FROM posts WHERE id = $1";
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Post not found" });
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
    const query = "SELECT * FROM posts WHERE slug = $1";
    const result = await pool.query(query, [slug]);
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Post not found" });
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

    if (featured_image_public_id) {
      await cloudinaryDelete(featured_image_public_id);
    }

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
  
  res.status(200).json({ 
    success: true,
    message: "Post updated successfully",
    post: result.rows[0]
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

  // Update publish status
  const published_at = is_published ? new Date().toISOString() : null;
  const result = await pool.query(
    `UPDATE posts 
     SET is_published = $1, published_at = $2, updated_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [is_published, published_at, id]
  );

  res.status(200).json({
    success: true,
    message: is_published ? "Post published successfully" : "Post unpublished successfully",
    post: result.rows[0],
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

export const getMonthlyPost = async (req, res) => {
  try {
    // month & year query থেকে নিবো
    // example: ?month=1&year=2025
    const { month, year } = req.query;
    const result = await pool.query(
      `
      SELECT
        COUNT(id) AS total_posts,
        COALESCE(SUM(likes), 0) AS total_likes,
        COALESCE(SUM(jsonb_array_length(comments)), 0) AS total_comments
      FROM posts
      WHERE
        EXTRACT(MONTH FROM created_at) = $1
        AND EXTRACT(YEAR FROM created_at) = $2;
      `,
      [month, year]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Monthly post not found" });
    }

    res.status(200).json({
      message: "Monthly post stats retrieved",
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error in get monthly post",
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
