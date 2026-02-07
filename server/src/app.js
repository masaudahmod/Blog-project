import express from "express";

import helmet from "helmet";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import cors from "cors";

import AuthRoutes from "./routes/auth.routes.js";
import CategoryRoutes from "./routes/category.routes.js";
import PostRoutes from "./routes/post.routes.js";
import newsletterRoutes from "./routes/newsletter.routes.js";
import CommentRoutes from "./routes/comment.routes.js";
import LikeRoutes from "./routes/like.routes.js";
import ActivityRoutes from "./routes/activity.routes.js";
import SiteContentRoutes from "./routes/siteContent.routes.js"; // Import site content routes
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();


// 🛡️ 1. Helmet — secure HTTP headers
app.use(helmet());


// 🛡️ 2. Rate Limiter — too many requests block
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per IP
  message: "Too many requests from this IP, please try again later."
});
app.use(limiter);


// 🛡️ 3. Prevent HTTP Parameter Pollution
app.use(hpp());


// 🛡️ 4. CORS Protection
app.use(cors({
  origin: [process.env.NEXT_PUBLIC_SITE_URL],
  credentials: true,
}));


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
app.use("/api/site-content", SiteContentRoutes); // Register site content routes

// Error handling middleware (must be last)
app.use(errorHandler);

app.get("/", (req, res) => {
  res.send("Welcome to the Journal Thoughts API");
});

export default app;
