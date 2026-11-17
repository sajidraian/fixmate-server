import { Request, Response } from "express";
import { getDB } from "../config/database.js";
import { ObjectId } from "mongodb";
export const getPublicServices = async (
  req: Request,
  res: Response
) => {
  try {
    const services = await getDB()
      .collection("services")
      .find({
        approvalStatus: "approved",
        isAvailable: true,
      })
      .sort({ createdAt: -1 })
      .toArray();

    const formattedServices = services.map((service) => ({
      ...service,
      _id: service._id.toString(),
    }));

    res.status(200).json({
      success: true,
      data: formattedServices,
    });
  } catch (error) {
    console.error("Error fetching public services:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch services",
    });
  }
};
export const getPublicServiceById = async (
  req: Request,
  res: Response
) => {
  try {
  const idParam = req.params.id;
const id = Array.isArray(idParam) ? idParam[0] : idParam;
   if (!id || !ObjectId.isValid(id)) {
  return res.status(400).json({
    success: false,
    message: "Invalid service ID",
  });
}

    const service = await getDB()
      .collection("services")
      .findOne({
        _id: new ObjectId(id),
        approvalStatus: "approved",
        isAvailable: true,
      });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...service,
        _id: service._id.toString(),
      },
    });
  } catch (error) {
    console.error("Error fetching service details:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch service details",
    });
  }
};