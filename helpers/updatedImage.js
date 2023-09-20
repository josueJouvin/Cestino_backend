import { deleteImage, uploadImage } from "../config/cloudinary.js";
import fs from "fs-extra"
import path from "path"

export async function imageUpdated(res,product,image,req) {
  if (image && image.mimetype.startsWith("image/")) {
    const fileExtension = path.extname(image.name).toLowerCase();
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

    if (!allowedExtensions.includes(fileExtension)) {
      return res.status(400).json({ msg: "Extensión de archivo no permitida" });
    }

    try {
      if (product.image?.public_id) {
        await deleteImage(product.image.public_id);
      }

      const result = await uploadImage(image.tempFilePath);
      product.image = {
        public_id: result.public_id,
        secure_url: result.secure_url,
      };

      await fs.unlink(image.tempFilePath);
    } catch (error) {
      return res.status(500).json({ msg: "Error al actualizar la imagen" });
    }
  }
  
  if (!req.files && !req.body.image.startsWith("https") && product.image?.public_id) {
    await deleteImage(product.image.public_id);
    product.image = null;
  }
}
