import express from "express";
import AuthRoutes from "./routes/auth.routes.js";
import CategoryRoutes from "./routes/category.routes.js";
import PostRoutes from "./routes/post.routes.js";

const app = express();
app.use(express.json());

app.use("/api/auth", AuthRoutes);
app.use("/api/category", CategoryRoutes);
app.use("/api/post", PostRoutes);

export default app;
