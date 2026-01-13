import express from "express";
import {
  addCategory,
  allCategories,
  deleteCategory,
  getCategory,
  updateCategory,
} from "../controllers/category.controller.js";
import { verifyAuth, allowRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", allCategories);
router.get("/:id", getCategory);

// Protected routes (admin only)
router.post("/add", verifyAuth, allowRoles("admin"), addCategory);
router.delete("/:id", verifyAuth, allowRoles("admin"), deleteCategory);
router.put("/update/:id", verifyAuth, allowRoles("admin"), updateCategory);

export default router;
