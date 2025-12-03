import express from "express";
import {
  addCategory,
  allCategories,
  getCategory,
  updateCategory,
} from "../controllers/category.controller.js";
import { verifyAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/add", verifyAdmin, addCategory);
router.get("/", allCategories);
router.get("/:id", getCategory)
router.put("/update/:id", verifyAdmin, updateCategory);

export default router;
