import express from "express";
import AuthRoutes from "./routes/auth.routes.js";
import CategoryRoutes from "./routes/category.routes.js";
import PostRoutes from "./routes/post.routes.js";
import newsletterRoutes from "./routes/newsletter.routes.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/api/auth", AuthRoutes);
app.use("/api/category", CategoryRoutes);
app.use("/api/post", PostRoutes);
app.use("/api", newsletterRoutes);

export default app;
