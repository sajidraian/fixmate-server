
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { connectDB } from "./config/database.js";

import serviceRoutes from "./routes/service.routes.js";
import userRoutes from "./routes/user.routes.js";
import bookingRoutes from "./routes/booking.routes.js";

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

// Home Route
app.get("/", (req, res) => {
  res.send("FixMate Server is Running Successfully!");
});

// API Routes
app.use("/api/services", serviceRoutes);
app.use("/api/users", userRoutes);
app.use("/api/bookings", bookingRoutes);

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
