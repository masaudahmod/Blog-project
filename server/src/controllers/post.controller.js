import { createPost, getPosts } from "../models/Post.model.js";

export const addPost = async (req, res) => {
  const newPost = await createPost(req.body);
  res.json(newPost.rows[0]);
};

export const allPosts = async (req, res) => {
  const posts = await getPosts();
  res.json(posts.rows);
};
