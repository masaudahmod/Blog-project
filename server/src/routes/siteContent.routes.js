import express from "express"; // Import express router
import { createContent, deleteContent, getAllContents, getContentByPageKey, updateContent } from "../controllers/siteContent.controller.js"; // Import controller handlers
import { allowRoles, verifyAuth } from "../middlewares/auth.middleware.js"; // Import auth middleware
const router = express.Router(); // Create a new router
router.get("/", getAllContents); // List all site contents for dashboard
router.get("/page/:page_key", getContentByPageKey); // Fetch content by page key for public site
router.post("/", verifyAuth, allowRoles("admin"), createContent); // Create content (admin only)
router.put("/:id", verifyAuth, allowRoles("admin"), updateContent); // Update content (admin only)
router.delete("/:id", verifyAuth, allowRoles("admin"), deleteContent); // Delete content (admin only)
export default router; // Export router
