import { Router } from "express";
import { uploadImage } from "../controllers/upload.controller.js";
import {
  authenticateUser,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/image",
  authenticateUser,
  authorizeRoles("technician"),
  uploadImage
);

export default router;