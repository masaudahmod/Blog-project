import express from "express";
import {
  likePost,
  unlikePost,
  checkLikeStatus,
  getLikeCount,
} from "../controllers/like.controller.js";

const router = express.Router();

// Public routes
router.post("/", likePost); // Like a post
router.delete("/", unlikePost); // Unlike a post
router.get("/check", checkLikeStatus); // Check if user has liked a post
router.get("/count/:postId", getLikeCount); // Get like count for a post

export default router;
