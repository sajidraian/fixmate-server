import { Router } from "express";
import { createBooking, getCustomerBookings, getTechnicianBookings, } from "../controllers/booking.controller.js";
import { authenticateUser, authorizeRoles, } from "../middleware/auth.middleware.js";
const router = Router();
// Customer - Create Booking
router.post("/", authenticateUser, authorizeRoles("customer"), createBooking);
// Customer - Get Own Bookings
router.get("/my", authenticateUser, authorizeRoles("customer"), getCustomerBookings);
// Technician - Get Assigned Bookings
router.get("/technician", authenticateUser, authorizeRoles("technician"), getTechnicianBookings);
export default router;
