import { Response } from "express";
import { getDB } from "../config/database.js";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";

export const getMyProfile = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const db = getDB();

    const user = await db.collection("user").findOne(
      { email: req.user?.email },
      {
        projection: {
          name: 1,
          email: 1,
          image: 1,
          role: 1,
          phone: 1,
          area: 1,
          bio: 1,
        },
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully.",
      data: user,
    });
  } catch (error) {
    console.error("Get Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile.",
    });
  }
};

export const updateMyProfile = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { name, phone, area, bio } = req.body;

    const updates: Record<string, string | Date> = {
      updatedAt: new Date(),
    };

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty.",
        });
      }
      updates.name = name.trim();
    }

    if (phone !== undefined) {
      if (typeof phone !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid phone number.",
        });
      }
      updates.phone = phone.trim();
    }

    if (area !== undefined) {
      if (typeof area !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid area.",
        });
      }
      updates.area = area.trim();
    }

    if (bio !== undefined) {
      if (typeof bio !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid bio.",
        });
      }
      updates.bio = bio.trim();
    }

    if (Object.keys(updates).length === 1) {
      return res.status(400).json({
        success: false,
        message: "No profile information provided.",
      });
    }

    const db = getDB();

    const result = await db.collection("user").updateOne(
      { email: req.user?.email },
      { $set: updates }
    );

    if (!result.matchedCount) {
      return res.status(404).json({
        success: false,
        message: "User profile not found.",
      });
    }

    const updatedUser = await db.collection("user").findOne(
      { email: req.user?.email },
      {
        projection: {
          name: 1,
          email: 1,
          image: 1,
          role: 1,
          phone: 1,
          area: 1,
          bio: 1,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update profile.",
    });
  }
};