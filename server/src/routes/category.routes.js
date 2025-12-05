import express from "express";
import {
  addCategory,
  allCategories,
  deleteCategory,
  getCategory,
  updateCategory,
} from "../controllers/category.controller.js";
import { verifyAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/add", verifyAdmin, addCategory);
router.get("/", allCategories);
router.route("/:id").get(getCategory).delete(verifyAdmin, deleteCategory);
router.put("/update/:id", verifyAdmin, updateCategory);

export default router;
