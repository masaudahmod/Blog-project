import express from "express";
// import AuthRoutes from "./routes/Auth.routes.js";
// import CategoryRoutes from "./routes/Category.routes.js";
// import PostRoutes from "./routes/Post.routes.js";

const app = express();
app.use(express.json());

// app.use("/api/auth", AuthRoutes);
// app.use("/api/category", CategoryRoutes);
// app.use("/api/post", PostRoutes);

export default app;
