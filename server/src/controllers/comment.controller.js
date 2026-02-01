import {
  createComment,
  getCommentsByPostId,
  getAllCommentsByPostId,
  getAllComments,
  getCommentById,
  updateCommentStatus,
  updateCommentMessage,
  deleteComment,
  getCommentCountByPostId,
} from "../models/comment.model.js";
import { asyncHandler, AppError } from "../middlewares/error.middleware.js";
import pool from "../config/db.js";
import { getCache, setCache, deleteCache } from "../config/redis.js";

const CACHE_TTL = 300; // 5 minutes
const LATEST_COMMENTS_LIMIT = 10;
const commentLatestKey = (postId) => `comment:latest:post:${postId}`;

/**
 * Create a new comment
 * POST /api/comments
 * Body: { post_id, user_identifier, message }
 */
export const addComment = asyncHandler(async (req, res) => {
  const { post_id, user_identifier, message } = req.body;

  // Validation
  if (!post_id || !user_identifier || !message) {
    throw new AppError("post_id, user_identifier, and message are required", 400);
  }

  if (typeof message !== "string" || message.trim().length === 0) {
    throw new AppError("Comment message cannot be empty", 400);
  }

  if (message.length > 5000) {
    throw new AppError("Comment message is too long (max 5000 characters)", 400);
  }

  const postCheck = await pool.query("SELECT id FROM posts WHERE id = $1", [post_id]);
  if (postCheck.rows.length === 0) {
    throw new AppError("Post not found", 404);
  }

  await deleteCache(commentLatestKey(post_id));
  const result = await createComment(post_id, user_identifier, message.trim());

  res.status(201).json({
    success: true,
    message: "Comment submitted successfully. It will be reviewed before being published.",
    comment: result.rows[0],
  });
});

/**
 * Get latest 10 approved comments for a post (public)
 * GET /api/comments/post/:postId
 */
export const getPostComments = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  if (!postId || isNaN(parseInt(postId))) {
    throw new AppError("Valid post ID is required", 400);
  }

  const pid = parseInt(postId);
  const cacheKey = commentLatestKey(pid);
  const cached = await getCache(cacheKey);
  if (cached) {
    return res.status(200).json({
      success: true,
      message: "Comments retrieved successfully",
      comments: cached.comments,
      count: cached.count,
      source: "cache",
    });
  }

  const result = await getCommentsByPostId(pid);
  const latest = result.rows.slice(0, LATEST_COMMENTS_LIMIT);
  const payload = { comments: latest, count: latest.length };
  await setCache(cacheKey, payload, CACHE_TTL);

  res.status(200).json({
    success: true,
    message: "Comments retrieved successfully",
    comments: latest,
    count: latest.length,
  });
});

/**
 * Get all comments for a post (including pending - for dashboard)
 * GET /api/comments/post/:postId/all
 * Requires: admin or moderator role
 */
export const getAllPostComments = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  if (!postId || isNaN(parseInt(postId))) {
    throw new AppError("Valid post ID is required", 400);
  }

  const result = await getAllCommentsByPostId(parseInt(postId));

  res.status(200).json({
    success: true,
    message: "Comments retrieved successfully",
    comments: result.rows,
    count: result.rows.length,
  });
});

/**
 * Get all comments (for moderation - admin/moderator only)
 * GET /api/comments?status=pending
 */
export const getComments = asyncHandler(async (req, res) => {
  const { status } = req.query;

  // Validate status if provided
  if (status && !["pending", "approved", "rejected"].includes(status)) {
    throw new AppError("Invalid status. Must be: pending, approved, or rejected", 400);
  }

  const result = await getAllComments(status || null);

  res.status(200).json({
    success: true,
    message: "Comments retrieved successfully",
    comments: result.rows,
    count: result.rows.length,
  });
});

/**
 * Update comment status (approve/reject)
 * PATCH /api/comments/:id
 * Body: { status: 'approved' | 'rejected' } OR { message: 'new message' }
 * Requires: admin or moderator role
 */
export const updateComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, message } = req.body;

  if (!id || isNaN(parseInt(id))) {
    throw new AppError("Valid comment ID is required", 400);
  }

  const commentCheck = await getCommentById(parseInt(id));
  if (commentCheck.rows.length === 0) {
    throw new AppError("Comment not found", 404);
  }

  const postId = commentCheck.rows[0].post_id;
  await deleteCache(commentLatestKey(postId));

  let result;

  // Update status
  if (status) {
    if (!["pending", "approved", "rejected"].includes(status)) {
      throw new AppError("Invalid status. Must be: pending, approved, or rejected", 400);
    }
    result = await updateCommentStatus(parseInt(id), status);
  }
  // Update message
  else if (message) {
    if (typeof message !== "string" || message.trim().length === 0) {
      throw new AppError("Comment message cannot be empty", 400);
    }
    if (message.length > 5000) {
      throw new AppError("Comment message is too long (max 5000 characters)", 400);
    }
    result = await updateCommentMessage(parseInt(id), message.trim());
  } else {
    throw new AppError("Either 'status' or 'message' is required", 400);
  }

  res.status(200).json({
    success: true,
    message: "Comment updated successfully",
    comment: result.rows[0],
  });
});

/**
 * Delete a comment
 * DELETE /api/comments/:id
 * Requires: admin or moderator role
 */
export const removeComment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(parseInt(id))) {
    throw new AppError("Valid comment ID is required", 400);
  }

  const commentCheck = await getCommentById(parseInt(id));
  if (commentCheck.rows.length === 0) {
    throw new AppError("Comment not found", 404);
  }

  const postId = commentCheck.rows[0].post_id;
  await deleteCache(commentLatestKey(postId));
  await deleteComment(parseInt(id));

  res.status(200).json({
    success: true,
    message: "Comment deleted successfully",
  });
});
