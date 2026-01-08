import express from "express";
import {
  addComment,
  getPostComments,
  getAllPostComments,
  getComments,
  updateComment,
  removeComment,
} from "../controllers/comment.controller.js";
import { verifyAuth, allowRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/", addComment); // Create comment (status = pending)
router.get("/post/:postId", getPostComments); // Get approved comments for a post

// Protected routes (admin/moderator only)
router.get("/", verifyAuth, allowRoles("admin", "moderator"), getComments); // Get all comments for moderation
router.get("/post/:postId/all", verifyAuth, allowRoles("admin", "moderator"), getAllPostComments); // Get all comments for a post (including pending)
router.patch("/:id", verifyAuth, allowRoles("admin", "moderator"), updateComment); // Update comment (approve/reject/edit)
router.delete("/:id", verifyAuth, allowRoles("admin", "moderator"), removeComment); // Delete comment

export default router;
