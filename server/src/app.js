import express from "express";
import AuthRoutes from "./routes/auth.routes.js";
import CategoryRoutes from "./routes/category.routes.js";
import PostRoutes from "./routes/post.routes.js";
import newsletterRoutes from "./routes/newsletter.routes.js";
import CommentRoutes from "./routes/comment.routes.js";
import LikeRoutes from "./routes/like.routes.js";
import ActivityRoutes from "./routes/activity.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/auth", AuthRoutes);
app.use("/api/category", CategoryRoutes);
app.use("/api/post", PostRoutes);
app.use("/api", newsletterRoutes);
app.use("/api/comments", CommentRoutes);
app.use("/api/likes", LikeRoutes);
app.use("/api/activity", ActivityRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
