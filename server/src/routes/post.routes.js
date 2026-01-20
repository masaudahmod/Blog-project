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
  getPostsByFilter,
  getPinnedPostController,
  likePostBySlug,
  pinPostController,
  unlikePostBySlug,
  updatePublishStatus,
  updatePostBySlug,
} from "../controllers/post.controller.js";
import { verifyAuth, allowRoles } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.post("/add", verifyAuth, allowRoles("admin"), upload.single("featured_image"), addPost);
router.get("/", allPosts);
router.get("/filter", getPostsByFilter); // Category filtering endpoint
router.route("/id/:id").get(getPost).delete(verifyAuth, allowRoles("admin"), deletePost);
router.route("/slug/:slug").get(getPostBySlug).put(verifyAuth, allowRoles("admin"), upload.single("featured_image"), updatePostBySlug).patch(verifyAuth, allowRoles("admin"), upload.single("featured_image"), updatePostBySlug);
router.patch("/:id/publish", verifyAuth, allowRoles("admin", "moderator"), updatePublishStatus);
router.patch("/:id/pin", verifyAuth, allowRoles("admin"), pinPostController);
router.get("/pinned", getPinnedPostController);

router.route("/comment/:id").post(addComment);

router
  .route("/comments/pending")
  .get(verifyAuth, allowRoles("admin"), getPendingComments)
  .post(verifyAuth, allowRoles("admin"), approveComment);

router.route("/monthly-stats").get(verifyAuth, allowRoles("admin"), getMonthlyPost);

router.post("/:slug/like", likePostBySlug);
router.post("/:slug/unlike", unlikePostBySlug);

export default router;
