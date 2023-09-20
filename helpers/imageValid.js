import fs from "fs-extra";
import path from "path";
import { uploadImage } from "../config/cloudinary.js";

export async function imageValid(res, imageFile) {
  if (imageFile && imageFile.mimetype.startsWith("image/")) {
    const allowedExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".tiff",
      ".webp",
      ".svg",
      ".ico",
      ".avif",
    ];

    const fileExtension = path.extname(imageFile.name).toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      console.log("first")
      return res.status(400).json({ msg: "Imagen no válida" });
    }

    const result = await uploadImage(imageFile.tempFilePath);
    await fs.unlink(imageFile.tempFilePath);

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
    };
  }
}
