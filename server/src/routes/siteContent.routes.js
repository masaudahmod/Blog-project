import express from "express"; // Import express router
import { createContent, deleteContent, getAllContents, getContentByPageKey, updateContent } from "../controllers/siteContent.controller.js"; // Import controller handlers
import { allowRoles, verifyAuth } from "../middlewares/auth.middleware.js"; // Import auth middleware
import { upload } from "../middlewares/multer.middleware.js"; // Import multer middleware for image uploads
const router = express.Router(); // Create a new router
router.get("/", getAllContents); // List all site contents for dashboard
router.get("/page/:page_key", getContentByPageKey); // Fetch content by page key for public site
router.post("/", verifyAuth, allowRoles("admin"), upload.single("image"), createContent); // Create content with image upload (admin only)
router.put("/:id", verifyAuth, allowRoles("admin"), upload.single("image"), updateContent); // Update content with image upload (admin only)
router.delete("/:id", verifyAuth, allowRoles("admin"), deleteContent); // Delete content (admin only)
export default router; // Export router
