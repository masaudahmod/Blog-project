import {
  createComment,
  getCommentsByPostId,
  getAllCommentsByPostId,
  getAllComments,
  getCommentById,
  updateCommentStatus,
  updateCommentMessage,
  updateCommentUserName,
  deleteComment,
  getCommentCountByPostId,
} from "../models/comment.model.js";
import { asyncHandler, AppError } from "../middlewares/error.middleware.js";
import pool from "../config/db.js";
import { getCache, setCache, deleteCache } from "../config/redis.js";

const CACHE_TTL = 300; // 5 minutes
const commentLatestKey = (postId) => `comment:latest:post:${postId}`;

/**
 * Create a new comment (top-level or reply)
 * POST /api/comments
 * Body: { post_id, user_identifier, message, parent_id?, user_name? }
 */
export const addComment = asyncHandler(async (req, res) => {
  const { post_id, user_identifier, message, parent_id, user_name } = req.body;

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

  // If reply: validate parent exists and belongs to same post
  let parentId = null;
  if (parent_id != null && parent_id !== "") {
    const pid = parseInt(parent_id);
    if (isNaN(pid)) {
      throw new AppError("Invalid parent_id", 400);
    }
    const parentCheck = await pool.query(
      "SELECT id, post_id FROM comments WHERE id = $1",
      [pid]
    );
    if (parentCheck.rows.length === 0) {
      throw new AppError("Parent comment not found", 404);
    }
    if (parentCheck.rows[0].post_id !== parseInt(post_id)) {
      throw new AppError("Parent comment does not belong to this post", 400);
    }
    parentId = pid;
  }

  // Optional display name: trim and limit length
  let userName = null;
  if (user_name != null && typeof user_name === "string" && user_name.trim().length > 0) {
    userName = user_name.trim().slice(0, 255);
  }

  await deleteCache(commentLatestKey(post_id));
  const result = await createComment(
    post_id,
    user_identifier,
    message.trim(),
    parentId,
    userName
  );

  res.status(201).json({
    success: true,
    message: "Comment posted successfully.",
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
  const comments = result.rows; // All approved, ordered for threading (top-level then replies)
  const payload = { comments, count: comments.length };
  await setCache(cacheKey, payload, CACHE_TTL);

  res.status(200).json({
    success: true,
    message: "Comments retrieved successfully",
    comments,
    count: comments.length,
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
 * Update comment status (approve/reject), message, or user_name
 * PATCH /api/comments/:id
 * Body: { status } | { message } | { user_name }
 * Requires: admin or moderator role
 */
export const updateComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, message, user_name } = req.body;

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

  if (status !== undefined) {
    if (!["pending", "approved", "rejected"].includes(status)) {
      throw new AppError("Invalid status. Must be: pending, approved, or rejected", 400);
    }
    result = await updateCommentStatus(parseInt(id), status);
  } else if (message !== undefined) {
    if (typeof message !== "string" || message.trim().length === 0) {
      throw new AppError("Comment message cannot be empty", 400);
    }
    if (message.length > 5000) {
      throw new AppError("Comment message is too long (max 5000 characters)", 400);
    }
    result = await updateCommentMessage(parseInt(id), message.trim());
  } else if (user_name !== undefined) {
    const name = typeof user_name === "string" && user_name.trim().length > 0
      ? user_name.trim().slice(0, 255)
      : null;
    result = await updateCommentUserName(parseInt(id), name);
  } else {
    throw new AppError("One of 'status', 'message', or 'user_name' is required", 400);
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
