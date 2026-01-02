import express from "express";
import {
  currentUser,
  login,
  logout,
  registerAdmin,
  registerUser,
} from "../controllers/auth.controller.js";
import { verifyAdmin } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.post("/register", registerAdmin);
router.post("/register-user", registerUser);
router.post("/login", login);

router.get("/me", verifyAdmin, currentUser);
router.post("/logout", verifyAdmin, logout);

export default router;
