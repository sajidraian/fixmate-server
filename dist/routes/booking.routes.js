import { Router } from "express";
import { createBooking, getCustomerBookings, getTechnicianBookings, updateBookingStatus, cancelBooking, } from "../controllers/booking.controller.js";
import { authenticateUser, authorizeRoles, } from "../middleware/auth.middleware.js";
const router = Router();
// Customer - Create Booking
router.post("/", authenticateUser, authorizeRoles("customer"), createBooking);
// Customer - Get Own Bookings
router.get("/my", authenticateUser, authorizeRoles("customer"), getCustomerBookings);
// Technician - Get Assigned Bookings
router.get("/technician", authenticateUser, authorizeRoles("technician"), getTechnicianBookings);
// Technician - Update Booking Status
router.patch("/:id/status", authenticateUser, authorizeRoles("technician"), updateBookingStatus);
// Customer - Cancel Booking
router.patch("/:id/cancel", authenticateUser, authorizeRoles("customer"), cancelBooking);
export default router;
