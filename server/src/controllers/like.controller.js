import {
  addPostLike,
  removePostLike,
  hasUserLikedPost,
  getPostLikeCount,
} from "../models/postLike.model.js";
import { asyncHandler, AppError } from "../middlewares/error.middleware.js";
import pool from "../config/db.js";

/**
 * Like a post
 * POST /api/likes
 * Body: { post_id, user_identifier }
 */
export const likePost = asyncHandler(async (req, res) => {
  const { post_id, user_identifier } = req.body;

  // Validation
  if (!post_id || !user_identifier) {
    throw new AppError("post_id and user_identifier are required", 400);
  }

  // Verify post exists
  const postCheck = await pool.query("SELECT id FROM posts WHERE id = $1", [post_id]);
  if (postCheck.rows.length === 0) {
    throw new AppError("Post not found", 404);
  }

  // Check if already liked
  const existingLike = await hasUserLikedPost(post_id, user_identifier);
  if (existingLike.rows.length > 0) {
    return res.status(200).json({
      success: true,
      message: "Post already liked",
      liked: true,
    });
  }

  // Add like
  const result = await addPostLike(post_id, user_identifier);

  if (!result) {
    // This shouldn't happen due to the check above, but handle it anyway
    return res.status(200).json({
      success: true,
      message: "Post already liked",
      liked: true,
    });
  }

  // Get updated like count
  const likeCountResult = await getPostLikeCount(post_id);
  const likeCount = parseInt(likeCountResult.rows[0].count);

  // Update posts table likes count (for backward compatibility)
  await pool.query("UPDATE posts SET likes = $1 WHERE id = $2", [likeCount, post_id]);

  res.status(201).json({
    success: true,
    message: "Post liked successfully",
    liked: true,
    likeCount,
  });
});

/**
 * Unlike a post
 * DELETE /api/likes
 * Body: { post_id, user_identifier }
 */
export const unlikePost = asyncHandler(async (req, res) => {
  const { post_id, user_identifier } = req.body;

  // Validation
  if (!post_id || !user_identifier) {
    throw new AppError("post_id and user_identifier are required", 400);
  }

  // Verify post exists
  const postCheck = await pool.query("SELECT id FROM posts WHERE id = $1", [post_id]);
  if (postCheck.rows.length === 0) {
    throw new AppError("Post not found", 404);
  }

  // Check if liked
  const existingLike = await hasUserLikedPost(post_id, user_identifier);
  if (existingLike.rows.length === 0) {
    return res.status(200).json({
      success: true,
      message: "Post not liked",
      liked: false,
    });
  }

  // Remove like
  await removePostLike(post_id, user_identifier);

  // Get updated like count
  const likeCountResult = await getPostLikeCount(post_id);
  const likeCount = parseInt(likeCountResult.rows[0].count);

  // Update posts table likes count (for backward compatibility)
  await pool.query("UPDATE posts SET likes = $1 WHERE id = $2", [likeCount, post_id]);

  res.status(200).json({
    success: true,
    message: "Post unliked successfully",
    liked: false,
    likeCount,
  });
});

/**
 * Check if user has liked a post
 * GET /api/likes/check?post_id=1&user_identifier=abc123
 */
export const checkLikeStatus = asyncHandler(async (req, res) => {
  const { post_id, user_identifier } = req.query;

  if (!post_id || !user_identifier) {
    throw new AppError("post_id and user_identifier are required", 400);
  }

  const result = await hasUserLikedPost(post_id, user_identifier);
  const liked = result.rows.length > 0;

  res.status(200).json({
    success: true,
    liked,
  });
});

/**
 * Get like count for a post
 * GET /api/likes/count/:postId
 */
export const getLikeCount = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  if (!postId || isNaN(parseInt(postId))) {
    throw new AppError("Valid post ID is required", 400);
  }

  const result = await getPostLikeCount(parseInt(postId));
  const count = parseInt(result.rows[0].count);

  res.status(200).json({
    success: true,
    count,
  });
});
