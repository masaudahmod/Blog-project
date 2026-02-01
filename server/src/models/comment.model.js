import pool from "../config/db.js";

/**
 * Creates the comments table
 * Stores user comments on posts with moderation status.
 * Supports threaded replies (parent_id) and optional per-comment display name (user_name).
 */
export const createCommentTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS comments (
      id SERIAL PRIMARY KEY,
      post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
      user_identifier VARCHAR(255) NOT NULL,
      user_name VARCHAR(255),
      message TEXT NOT NULL,
      status VARCHAR(20) DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Index for faster queries (parent_id index added in alterCommentTableAddThreadAndName)
    CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
    CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
    CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);
  `);
};

/**
 * Migration: add parent_id and user_name to existing comments table
 */
export const alterCommentTableAddThreadAndName = async () => {
  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'parent_id') THEN
        ALTER TABLE comments ADD COLUMN parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'user_name') THEN
        ALTER TABLE comments ADD COLUMN user_name VARCHAR(255);
      END IF;
    END $$;
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
  `);
};

/**
 * Migration: set default comment status to 'approved' (comments show immediately; remove via dashboard delete)
 */
export const alterCommentTableDefaultApproved = async () => {
  await pool.query(`
    ALTER TABLE comments ALTER COLUMN status SET DEFAULT 'approved';
  `);
};

/**
 * Create a new comment (top-level or reply)
 * @param {number} postId - Post ID
 * @param {string} userIdentifier - Anonymous user identifier
 * @param {string} message - Comment text
 * @param {number|null} [parentId=null] - Parent comment ID for replies
 * @param {string|null} [userName=null] - Optional display name for this comment
 */
export const createComment = (postId, userIdentifier, message, parentId = null, userName = null) => {
  return pool.query(
    `INSERT INTO comments (post_id, parent_id, user_identifier, user_name, message, status)
     VALUES ($1, $2, $3, $4, $5, 'approved')
     RETURNING *`,
    [postId, parentId, userIdentifier, userName || null, message]
  );
};

/**
 * Get all approved comments for a post (flat list with parent_id for threading)
 * Top-level first (parent_id IS NULL), then by created_at. Client builds tree.
 */
export const getCommentsByPostId = (postId) => {
  return pool.query(
    `SELECT * FROM comments 
     WHERE post_id = $1 AND status = 'approved'
     ORDER BY (parent_id IS NULL) DESC, COALESCE(parent_id, id), created_at ASC`,
    [postId]
  );
};

/**
 * Get all comments for a post (including pending - for dashboard), threaded order
 */
export const getAllCommentsByPostId = (postId) => {
  return pool.query(
    `SELECT * FROM comments 
     WHERE post_id = $1
     ORDER BY 
       CASE WHEN status = 'pending' THEN 0 ELSE 1 END,
       (parent_id IS NULL) DESC,
       COALESCE(parent_id, id),
       created_at ASC`,
    [postId]
  );
};

/**
 * Get comment count for a post
 */
export const getCommentCountByPostId = (postId) => {
  return pool.query(
    `SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'pending') as pending,
      COUNT(*) FILTER (WHERE status = 'approved') as approved
     FROM comments 
     WHERE post_id = $1`,
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
 * Update comment display name (optional per-comment name)
 */
export const updateCommentUserName = (id, user_name) => {
  return pool.query(
    `UPDATE comments 
     SET user_name = $1 
     WHERE id = $2
     RETURNING *`,
    [user_name, id]
  );
};

/**
 * Delete a comment
 */
export const deleteComment = (id) => {
  return pool.query(`DELETE FROM comments WHERE id = $1 RETURNING *`, [id]);
};
