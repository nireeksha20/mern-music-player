import express from "express";
import {
  editProfile,
  resetPassword,
  forgotPassword,
  getMe,
  login,
  signup,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.patch("/profile", protect, editProfile);

export default router;
