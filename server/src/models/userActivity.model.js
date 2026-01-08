import pool from "../config/db.js";

/**
 * Creates the user_activity table
 * Tracks user interactions (likes, comments, views) for analytics
 */
export const createUserActivityTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_activity (
      id SERIAL PRIMARY KEY,
      post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      user_identifier VARCHAR(255) NOT NULL,
      action_type VARCHAR(20) NOT NULL CHECK (action_type IN ('like', 'comment', 'view')),
      device_info TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Indexes for faster queries
    CREATE INDEX IF NOT EXISTS idx_user_activity_post_id ON user_activity(post_id);
    CREATE INDEX IF NOT EXISTS idx_user_activity_user_identifier ON user_activity(user_identifier);
    CREATE INDEX IF NOT EXISTS idx_user_activity_action_type ON user_activity(action_type);
    CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity(created_at);
  `);
};

/**
 * Log user activity
 */
export const logUserActivity = (postId, userIdentifier, actionType, deviceInfo = null) => {
  return pool.query(
    `INSERT INTO user_activity (post_id, user_identifier, action_type, device_info)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [postId, userIdentifier, actionType, deviceInfo]
  );
};

/**
 * Get activity for a specific post
 */
export const getActivityByPostId = (postId) => {
  return pool.query(
    `SELECT * FROM user_activity 
     WHERE post_id = $1
     ORDER BY created_at DESC`,
    [postId]
  );
};

/**
 * Get activity by action type
 */
export const getActivityByActionType = (actionType, limit = 100) => {
  return pool.query(
    `SELECT * FROM user_activity 
     WHERE action_type = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [actionType, limit]
  );
};

/**
 * Get activity statistics for a post
 */
export const getPostActivityStats = (postId) => {
  return pool.query(
    `SELECT 
      action_type,
      COUNT(*) as count
     FROM user_activity
     WHERE post_id = $1
     GROUP BY action_type`,
    [postId]
  );
};
