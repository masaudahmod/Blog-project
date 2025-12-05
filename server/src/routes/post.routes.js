import express from "express";
import { addPost, allPosts, deletePost, getPost } from "../controllers/post.controller.js";
import { verifyAdmin } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.post("/add", verifyAdmin, upload.single("featured_image"), addPost);
router.get("/", allPosts);
router.route("/:id").get(getPost).delete(verifyAdmin, deletePost);

export default router;
