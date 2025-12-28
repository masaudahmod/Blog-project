import express from "express";
import {
  addComment,
  addPost,
  allPosts,
  approveComment,
  deletePost,
  getMonthlyPost,
  getPendingComments,
  getPost,
  getPostBySlug,
} from "../controllers/post.controller.js";
import { verifyAdmin } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.post("/add", verifyAdmin, upload.single("featured_image"), addPost);
router.get("/", allPosts);
router.route("/id/:id").get(getPost).delete(verifyAdmin, deletePost);
router.route("/slug/:slug").get(getPostBySlug);

router.route("/comment/:id").post(addComment);

router.route("/comments/pending").get(verifyAdmin, getPendingComments).post(verifyAdmin, approveComment);

router.route('/monthly-stats').get(verifyAdmin, getMonthlyPost);


export default router;