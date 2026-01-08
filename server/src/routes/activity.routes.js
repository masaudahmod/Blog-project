import express from "express";
import {
  logActivity,
  getPostActivity,
  getActivityStats,
} from "../controllers/activity.controller.js";
import { verifyAuth, allowRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public route
router.post("/", logActivity); // Log user activity

// Protected routes (admin/moderator only)
router.get("/post/:postId", verifyAuth, allowRoles("admin", "moderator"), getPostActivity); // Get activity for a post
router.get("/stats/:postId", verifyAuth, allowRoles("admin", "moderator"), getActivityStats); // Get activity statistics

export default router;
