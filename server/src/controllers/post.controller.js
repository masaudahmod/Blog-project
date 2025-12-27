import pool from "../config/db.js";
import { cloudinaryDelete, cloudinaryUpload } from "../service/cloudinary.js";

export const addPost = async (req, res) => {
  try {
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
      return res.status(400).json({ message: "Missing required fields" });
    }
    const result = await pool.query(
      `Insert into posts (title, slug, content, featured_image_url, featured_image_public_id, featured_image_alt, featured_image_caption, meta_title, meta_description, meta_keywords, canonical_url, schema_type, category_id, tags, read_time, likes, comments, interactions, is_published, published_at, updated_at) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21) returning *`,
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
      .json({ message: "Post created", post: result.rows[0] });
  } catch (error) {
    console.log("error  in add post", error.message);
    return res.status(500).json({
      message: `Server Error in add post: ${error.message}`,
      error: error.message,
    });
  }
};

export const allPosts = async (req, res) => {
  try {
    const limit = 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    // const query = `SELECT * FROM posts ORDER BY id DESC LIMIT $1 OFFSET $2`;
    const query = `
      SELECT 
        posts.*,
        json_build_object(
          'id', categories.id,
          'name', categories.name,
          'slug', categories.slug
        ) AS category
      FROM posts
      LEFT JOIN categories ON posts.category_id = categories.id
      ORDER BY posts.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const posts = await pool.query(query, [limit, offset]);

    const totalQuery = "SELECT COUNT(*) FROM posts";
    const totalResult = await pool.query(totalQuery);
    const totalPosts = parseInt(totalResult.rows[0].count);
    const totalPages = Math.ceil(totalPosts / limit);

    res.status(200).json({
      message: "Posts retrieved",
      currentPage: page,
      totalPages,
      posts: posts.rows,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

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

export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const result = await updatePost(id, data);
    if (result.rowCount === 0)
      return res.status(404).json({ message: "Post not found" });
    res.status(200).json({ message: "Post updated" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

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
