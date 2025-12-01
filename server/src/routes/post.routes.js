import express from "express";
import { addPost, allPosts } from "../controllers/post.controller.js";
import { verifyAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/add", verifyAdmin, addPost);
router.get("/", allPosts);

export default router;
