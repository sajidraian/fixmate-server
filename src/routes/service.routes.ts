import { Router } from "express";
import {
  getPublicServices,
  getPublicServiceById,
} from "../controllers/service.controller.js";

const router = Router();

// Get all approved and available services
router.get("/", getPublicServices);

// Get one service by ID
router.get("/:id", getPublicServiceById);

export default router;