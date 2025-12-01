import express from "express";
import { addCategory, allCategories } from "../controllers/category.controller.js";
import { verifyAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/add", verifyAdmin, addCategory);
router.get("/", allCategories);

export default router;
