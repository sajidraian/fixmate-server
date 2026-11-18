
import { Router } from "express";
import { createBooking } from "../controllers/booking.controller.js";
import {
  authenticateUser,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

const router = Router();

// Customer Only - Create Booking
router.post(
  "/",
  authenticateUser,
  authorizeRoles("customer"),
  createBooking
);

export default router;
