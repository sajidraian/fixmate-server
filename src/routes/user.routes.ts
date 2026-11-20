import { Router } from "express";
import {
  authenticateUser,
  authorizeRoles,
  AuthenticatedRequest,
} from "../middleware/auth.middleware.js";

import {
  getMyProfile,
  updateMyProfile,
} from "../controllers/user.controller.js";

const router = Router();

// Get logged-in user profile
router.get("/me", authenticateUser, getMyProfile);

// Update logged-in user profile
router.patch("/profile", authenticateUser, updateMyProfile);

// Customer Only
router.get(
  "/customer",
  authenticateUser,
  authorizeRoles("customer"),
  (req, res) => {
    res.json({ success: true, message: "Customer access granted!" });
  }
);

// Technician Only
router.get(
  "/technician",
  authenticateUser,
  authorizeRoles("technician"),
  (req, res) => {
    res.json({ success: true, message: "Technician access granted!" });
  }
);

// Admin Only
router.get(
  "/admin",
  authenticateUser,
  authorizeRoles("admin"),
  (req, res) => {
    res.json({ success: true, message: "Admin access granted!" });
  }
);

export default router;