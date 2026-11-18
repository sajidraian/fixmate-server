import { getDB } from "../config/database.js";
import { ObjectId } from "mongodb";
// Get All Public Services
export const getPublicServices = async (req, res) => {
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
    }
    catch (error) {
        console.error("Error fetching public services:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch services",
        });
    }
};
// Get Public Service Details
export const getPublicServiceById = async (req, res) => {
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
    }
    catch (error) {
        console.error("Error fetching service details:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch service details",
        });
    }
};
// Create New Service (Technician Only)
export const createService = async (req, res) => {
    try {
        const { title, category, description, image, basePrice, estimatedDuration, serviceMode, serviceArea, technicianName, } = req.body;
        if (!title ||
            !category ||
            !description ||
            !image ||
            basePrice === undefined ||
            !estimatedDuration ||
            !serviceMode ||
            !serviceArea ||
            !technicianName) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required service information.",
            });
        }
        if (typeof basePrice !== "number" ||
            !Number.isFinite(basePrice) ||
            basePrice <= 0) {
            return res.status(400).json({
                success: false,
                message: "Base price must be a positive number.",
            });
        }
        if (!["Home Visit", "Shop Drop-off"].includes(serviceMode)) {
            return res.status(400).json({
                success: false,
                message: "Invalid service mode.",
            });
        }
        const newService = {
            title: String(title).trim(),
            category: String(category).trim(),
            description: String(description).trim(),
            image: String(image).trim(),
            basePrice,
            estimatedDuration: String(estimatedDuration).trim(),
            serviceMode,
            serviceArea: String(serviceArea).trim(),
            technicianName: String(technicianName).trim(),
            technicianEmail: req.user.email,
            approvalStatus: "pending",
            isAvailable: true,
            createdAt: new Date(),
        };
        const result = await getDB()
            .collection("services")
            .insertOne(newService);
        res.status(201).json({
            success: true,
            message: "Service submitted for admin approval.",
            data: {
                ...newService,
                _id: result.insertedId.toString(),
            },
        });
    }
    catch (error) {
        console.error("Error creating service:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create service.",
        });
    }
};
// Get Pending Services (Admin Only)
export const getPendingServices = async (req, res) => {
    try {
        const services = await getDB()
            .collection("services")
            .find({ approvalStatus: "pending" })
            .sort({ createdAt: -1 })
            .toArray();
        res.status(200).json({
            success: true,
            data: services.map((service) => ({
                ...service,
                _id: service._id.toString(),
            })),
        });
    }
    catch (error) {
        console.error("Error fetching pending services:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch pending services.",
        });
    }
};
// Approve or Reject Service (Admin Only)
export const updateServiceApproval = async (req, res) => {
    try {
        const idParam = req.params.id;
        const id = Array.isArray(idParam) ? idParam[0] : idParam;
        const { approvalStatus } = req.body;
        if (!id || !ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid service ID.",
            });
        }
        if (!["approved", "rejected"].includes(approvalStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid approval status.",
            });
        }
        const result = await getDB()
            .collection("services")
            .updateOne({
            _id: new ObjectId(id),
            approvalStatus: "pending",
        }, {
            $set: {
                approvalStatus,
                updatedAt: new Date(),
            },
        });
        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Pending service not found.",
            });
        }
        res.status(200).json({
            success: true,
            message: `Service ${approvalStatus} successfully.`,
        });
    }
    catch (error) {
        console.error("Error updating service approval:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update service approval.",
        });
    }
};
