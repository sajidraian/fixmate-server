import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { connectDB } from "./config/database.js";

import serviceRoutes from "./routes/service.routes.js";
import userRoutes from "./routes/user.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import paymentRoutes from "./routes/payment.routes.js";

import { handleStripeWebhook } from "./controllers/webhook.controller.js";
import uploadRoutes from "./routes/upload.routes.js";

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Stripe Webhook - Must be before express.json()
app.post(
  "/api/webhooks/stripe",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

// JSON Middleware
app.use(express.json({ limit: "10mb" }));

// Home Route
app.get("/", (req, res) => {
  res.send("FixMate Server is Running Successfully!");
});

// API Routes
app.use("/api/services", serviceRoutes);
app.use("/api/users", userRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/uploads", uploadRoutes);

// Server Port
const PORT = process.env.PORT || 5000;

// Start Server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`FixMate server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();