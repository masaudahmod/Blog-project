import pool from "../config/db.js";

/**
 * Creates the comments table
 * Stores user comments on posts with moderation status
 */
export const createCommentTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS comments (
      id SERIAL PRIMARY KEY,
      post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      user_identifier VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Index for faster queries
    CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
    CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
    CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);
  `);
};

/**
 * Create a new comment
 */
export const createComment = (postId, userIdentifier, message) => {
  return pool.query(
    `INSERT INTO comments (post_id, user_identifier, message, status)
     VALUES ($1, $2, $3, 'pending')
     RETURNING *`,
    [postId, userIdentifier, message]
  );
};

/**
 * Get all approved comments for a post
 */
export const getCommentsByPostId = (postId) => {
  return pool.query(
    `SELECT * FROM comments 
     WHERE post_id = $1 AND status = 'approved'
     ORDER BY created_at DESC`,
    [postId]
  );
};

/**
 * Get all comments (for moderation - admin/moderator only)
 */
export const getAllComments = (status = null) => {
  if (status) {
    return pool.query(
      `SELECT 
        c.*,
        p.title as post_title,
        p.slug as post_slug
       FROM comments c
       LEFT JOIN posts p ON c.post_id = p.id
       WHERE c.status = $1
       ORDER BY c.created_at DESC`,
      [status]
    );
  }
  return pool.query(
    `SELECT 
      c.*,
      p.title as post_title,
      p.slug as post_slug
     FROM comments c
     LEFT JOIN posts p ON c.post_id = p.id
     ORDER BY 
       CASE WHEN c.status = 'pending' THEN 0 ELSE 1 END,
       c.created_at DESC`
  );
};

/**
 * Get a single comment by ID
 */
export const getCommentById = (id) => {
  return pool.query(
    `SELECT 
      c.*,
      p.title as post_title,
      p.slug as post_slug
     FROM comments c
     LEFT JOIN posts p ON c.post_id = p.id
     WHERE c.id = $1`,
    [id]
  );
};

/**
 * Update comment status (approve/reject)
 */
export const updateCommentStatus = (id, status) => {
  return pool.query(
    `UPDATE comments 
     SET status = $1 
     WHERE id = $2
     RETURNING *`,
    [status, id]
  );
};

/**
 * Update comment message
 */
export const updateCommentMessage = (id, message) => {
  return pool.query(
    `UPDATE comments 
     SET message = $1 
     WHERE id = $2
     RETURNING *`,
    [message, id]
  );
};

/**
 * Delete a comment
 */
export const deleteComment = (id) => {
  return pool.query(`DELETE FROM comments WHERE id = $1 RETURNING *`, [id]);
};
