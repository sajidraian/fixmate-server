
import { Response } from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../config/database.js";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";

// Create Booking
export const createBooking = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const {
      serviceId,
      address,
      preferredDate,
      problemDescription,
      customerPhone,
    } = req.body;

    if (
      !serviceId ||
      !ObjectId.isValid(serviceId) ||
      !address?.trim() ||
      !preferredDate ||
      !problemDescription?.trim() ||
      !customerPhone?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required booking information.",
      });
    }

    const db = getDB();

    // Find Approved Service
    const service = await db.collection("services").findOne({
      _id: new ObjectId(serviceId),
      approvalStatus: "approved",
      isAvailable: true,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service is not available.",
      });
    }

    // Prevent Booking Own Service
    if (service.technicianEmail === req.user?.email) {
      return res.status(403).json({
        success: false,
        message: "You cannot book your own service.",
      });
    }

    // Get Customer Profile
    const customer = await db.collection("user").findOne({
      email: req.user?.email,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer profile not found.",
      });
    }

    const date = new Date(preferredDate);

    if (Number.isNaN(date.getTime()) || date <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid future date.",
      });
    }

    // Prevent Duplicate Active Booking
    const existingBooking = await db.collection("bookings").findOne({
      serviceId,
      customerEmail: req.user?.email,
      status: {
        $in: ["requested", "accepted", "in-progress"],
      },
    });

    if (existingBooking) {
      return res.status(409).json({
        success: false,
        message: "You already have an active booking for this service.",
      });
    }

    const booking = {
      serviceId,
      serviceTitle: service.title,
      serviceImage: service.image,
      category: service.category,
      basePrice: service.basePrice,
      technicianName: service.technicianName,
      technicianEmail: service.technicianEmail,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customerPhone.trim(),
      address: address.trim(),
      preferredDate: date,
      problemDescription: problemDescription.trim(),
      status: "requested",
      finalAmount: service.basePrice,
      paymentStatus: "unpaid",
      createdAt: new Date(),
    };

    const result = await db.collection("bookings").insertOne(booking);

    return res.status(201).json({
      success: true,
      message: "Booking request submitted successfully!",
      data: {
        ...booking,
        _id: result.insertedId,
      },
    });
  } catch (error) {
    console.error("Create Booking Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create booking.",
    });
  }
};

// Get Customer Bookings
export const getCustomerBookings = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const bookings = await getDB()
      .collection("bookings")
      .find({
        customerEmail: req.user?.email,
      })
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Customer Bookings Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer bookings.",
    });
  }
};

// Get Technician Bookings
export const getTechnicianBookings = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const bookings = await getDB()
      .collection("bookings")
      .find({
        technicianEmail: req.user?.email,
      })
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Technician Bookings Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch technician bookings.",
    });
  }
};
// Update Booking Status (Technician)
export const updateBookingStatus = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const id = req.params.id;

if (typeof id !== "string") {
  return res.status(400).json({
    success: false,
    message: "Invalid booking ID.",
  });
}
    const { status, finalAmount } = req.body;

    const allowedStatuses = [
      "accepted",
      "rejected",
      "in-progress",
      "completed",
    ];

    if (!ObjectId.isValid(id) || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID or status.",
      });
    }

    const db = getDB();

    const booking = await db.collection("bookings").findOne({
      _id: new ObjectId(id),
      technicianEmail: req.user?.email,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    const allowedTransitions: Record<string, string[]> = {
      requested: ["accepted", "rejected"],
      accepted: ["in-progress"],
      "in-progress": ["completed"],
    };

    if (!allowedTransitions[booking.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "This status update is not allowed.",
      });
    }

    const updateData: Record<string, unknown> = {
      status,
      updatedAt: new Date(),
    };

    if (status === "completed") {
      const amount = Number(finalAmount);

      if (!Number.isFinite(amount) || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid final amount.",
        });
      }

      updateData.finalAmount = amount;
    }

    await db.collection("bookings").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    return res.status(200).json({
      success: true,
      message: "Booking status updated successfully!",
    });
  } catch (error) {
    console.error("Update Booking Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update booking status.",
    });
  }
};