import pool from "../config/db.js";

/**
 * Creates the post_likes table
 * Tracks user likes on posts with unique constraint to prevent duplicates
 */
export const createPostLikeTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS post_likes (
      id SERIAL PRIMARY KEY,
      post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      user_identifier VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(post_id, user_identifier)
    );
    
    -- Indexes for faster queries
    CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
    CREATE INDEX IF NOT EXISTS idx_post_likes_user_identifier ON post_likes(user_identifier);
  `);
};

/**
 * Add a like to a post
 * Returns the like if successful, or null if duplicate
 */
export const addPostLike = async (postId, userIdentifier) => {
  try {
    const result = await pool.query(
      `INSERT INTO post_likes (post_id, user_identifier)
       VALUES ($1, $2)
       ON CONFLICT (post_id, user_identifier) DO NOTHING
       RETURNING *`,
      [postId, userIdentifier]
    );
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Remove a like from a post
 */
export const removePostLike = (postId, userIdentifier) => {
  return pool.query(
    `DELETE FROM post_likes 
     WHERE post_id = $1 AND user_identifier = $2
     RETURNING *`,
    [postId, userIdentifier]
  );
};

/**
 * Check if user has liked a post
 */
export const hasUserLikedPost = (postId, userIdentifier) => {
  return pool.query(
    `SELECT * FROM post_likes 
     WHERE post_id = $1 AND user_identifier = $2`,
    [postId, userIdentifier]
  );
};

/**
 * Get total likes count for a post
 */
export const getPostLikeCount = (postId) => {
  return pool.query(
    `SELECT COUNT(*) as count FROM post_likes WHERE post_id = $1`,
    [postId]
  );
};

/**
 * Get all likes for a post
 */
export const getLikesByPostId = (postId) => {
  return pool.query(
    `SELECT * FROM post_likes 
     WHERE post_id = $1
     ORDER BY created_at DESC`,
    [postId]
  );
};
