import pool from "../config/db.js";
import { createPost, getPosts } from "../models/post.model.js";

export const addPost = async (req, res) => {
  try {
    let {
      title,
      slug,
      content,
      featured_image_url,
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
      `Insert into posts (title, slug, content, featured_image_url, featured_image_alt, featured_image_caption, meta_title, meta_description, meta_keywords, canonical_url, schema_type, category_id, tags, read_time, likes, comments, interactions, is_published, published_at, updated_at) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20) returning *`,
      [
        title,
        slug,
        content,

        featured_image_url,
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
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
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

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const query = "DELETE FROM posts WHERE id = $1";
    const results = await pool.query(query, [id]);
    if (results.rowCount === 0)
      return res.status(404).json({ message: "Post not found" });
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
