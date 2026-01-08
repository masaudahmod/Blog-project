import { logUserActivity, getActivityByPostId, getPostActivityStats } from "../models/userActivity.model.js";
import { asyncHandler, AppError } from "../middlewares/error.middleware.js";
import pool from "../config/db.js";

/**
 * Log user activity
 * POST /api/activity
 * Body: { post_id, user_identifier, action_type, device_info? }
 */
export const logActivity = asyncHandler(async (req, res) => {
  const { post_id, user_identifier, action_type, device_info } = req.body;

  // Validation
  if (!post_id || !user_identifier || !action_type) {
    throw new AppError("post_id, user_identifier, and action_type are required", 400);
  }

  if (!["like", "comment", "view"].includes(action_type)) {
    throw new AppError("Invalid action_type. Must be: like, comment, or view", 400);
  }

  // Verify post exists
  const postCheck = await pool.query("SELECT id FROM posts WHERE id = $1", [post_id]);
  if (postCheck.rows.length === 0) {
    throw new AppError("Post not found", 404);
  }

  // Log activity
  const result = await logUserActivity(
    post_id,
    user_identifier,
    action_type,
    device_info || null
  );

  res.status(201).json({
    success: true,
    message: "Activity logged successfully",
    activity: result.rows[0],
  });
});

/**
 * Get activity for a specific post
 * GET /api/activity/post/:postId
 * Requires: admin or moderator role
 */
export const getPostActivity = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  if (!postId || isNaN(parseInt(postId))) {
    throw new AppError("Valid post ID is required", 400);
  }

  const result = await getActivityByPostId(parseInt(postId));

  res.status(200).json({
    success: true,
    message: "Activity retrieved successfully",
    activities: result.rows,
    count: result.rows.length,
  });
});

/**
 * Get activity statistics for a post
 * GET /api/activity/stats/:postId
 * Requires: admin or moderator role
 */
export const getActivityStats = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  if (!postId || isNaN(parseInt(postId))) {
    throw new AppError("Valid post ID is required", 400);
  }

  const result = await getPostActivityStats(parseInt(postId));

  // Format stats
  const stats = {
    likes: 0,
    comments: 0,
    views: 0,
  };

  result.rows.forEach((row) => {
    stats[row.action_type] = parseInt(row.count);
  });

  res.status(200).json({
    success: true,
    message: "Activity statistics retrieved successfully",
    stats,
  });
});
