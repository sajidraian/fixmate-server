import { Router } from "express";
import {
  authenticateUser,
  authorizeRoles,
  AuthenticatedRequest,
} from "../middleware/auth.middleware.js";

const router = Router();

// Logged-in User Profile
router.get(
  "/me",
  authenticateUser,
  (req: AuthenticatedRequest, res) => {
    res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
      data: req.user,
    });
  }
);

// Customer Only
router.get(
  "/customer",
  authenticateUser,
  authorizeRoles("customer"),
  (req, res) => {
    res.json({
      success: true,
      message: "Customer access granted!",
    });
  }
);

// Technician Only
router.get(
  "/technician",
  authenticateUser,
  authorizeRoles("technician"),
  (req, res) => {
    res.json({
      success: true,
      message: "Technician access granted!",
    });
  }
);

// Admin Only
router.get(
  "/admin",
  authenticateUser,
  authorizeRoles("admin"),
  (req, res) => {
    res.json({
      success: true,
      message: "Admin access granted!",
    });
  }
);

export default router;