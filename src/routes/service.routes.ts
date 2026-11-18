import { Router } from "express";

import {
  getPublicServices,
  getPublicServiceById,
  createService,
  getPendingServices,
  updateServiceApproval,
} from "../controllers/service.controller.js";

import {
  authenticateUser,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

const router = Router();

// Public Routes
router.get("/", getPublicServices);
router.get("/:id", getPublicServiceById);

// Admin Routes
router.get(
  "/admin/pending",
  authenticateUser,
  authorizeRoles("admin"),
  getPendingServices
);

router.patch(
  "/:id/approval",
  authenticateUser,
  authorizeRoles("admin"),
  updateServiceApproval
);

// Technician Only - Create Service
router.post(
  "/",
  authenticateUser,
  authorizeRoles("technician"),
  createService
);

export default router;