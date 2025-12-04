import express from "express";
import { currentUser, loginAdmin, logout, registerAdmin } from "../controllers/auth.controller.js";
import { verifyAdmin } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

router.get("/me", verifyAdmin, currentUser);
router.post("/logout", verifyAdmin, logout);

export default router;
