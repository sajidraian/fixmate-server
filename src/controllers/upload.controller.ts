import { Request, Response } from "express";

export const uploadImage = async (req: Request, res: Response) => {
  try {
    const apiKey = process.env.IMGBB_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: "ImgBB API key is missing.",
      });
    }

    const { image } = req.body;

    if (!image || typeof image !== "string") {
      return res.status(400).json({
        success: false,
        message: "Please provide an image.",
      });
    }

    const base64Image = image.replace(
      /^data:image\/[a-zA-Z0-9.+-]+;base64,/,
      ""
    );

    if (
      !/^[A-Za-z0-9+/]+={0,2}$/.test(base64Image) ||
      base64Image.length > 8 * 1024 * 1024
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid image or image is too large.",
      });
    }

    const formData = new FormData();
    formData.append("image", base64Image);

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      return res.status(400).json({
        success: false,
        message: "Image upload failed.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Image uploaded successfully.",
      data: {
        url: result.data.display_url,
      },
    });
  } catch (error) {
    console.error("ImgBB Upload Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to upload image.",
    });
  }
};