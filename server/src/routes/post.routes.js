import express from "express";
import { addPost, allPosts, deletePost, getPost } from "../controllers/post.controller.js";
import { verifyAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/add", verifyAdmin, addPost);
router.get("/", allPosts);
router.route("/:id").get(getPost).delete(verifyAdmin, deletePost);

export default router;
