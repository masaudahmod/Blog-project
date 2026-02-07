import express from "express";
import {
  activateUser,
  currentUser,
  deleteUser,
  getPendingUser,
  login,
  logout,
  registerAdmin,
  registerUser,
} from "../controllers/auth.controller.js";
import { allowRoles, verifyAuth } from "../middlewares/auth.middleware.js";
import { loginLimiter } from "../middlewares/security.js";

const router = express.Router();

router.post("/register", registerAdmin);
router.post("/register-user", registerUser);
router.post("/login", loginLimiter, login);
const adminOnly = [verifyAuth, allowRoles("admin")];

router.route("/pending-user").get(...adminOnly, getPendingUser)
router.route("/pending-user/:id").post(...adminOnly, activateUser).delete(...adminOnly, deleteUser);

router.get("/me", ...adminOnly, currentUser);
router.post("/logout", ...adminOnly, logout);

export default router;