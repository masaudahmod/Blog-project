import pool from "../config/db.js";
import { createPost, getPosts } from "../models/post.model.js";

export const addPost = async (req, res) => {
  try {
    const data = req.body;
    const newPost = await createPost(data);
    return res
      .status(201)
      .json({ message: "Post created", post: newPost.rows[0] });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

export const allPosts = async (req, res) => {
  try {
    const posts = await getPosts();
    res.status(200).json({ message: "Posts retrieved", posts: posts.rows });
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