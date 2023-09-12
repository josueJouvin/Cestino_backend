import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_KEY, 
    api_secret: process.env.CLOUDINARY_SECRET,
    secure: true
});

export async function uploadImage(filePath) {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: "cestino",
            format: "webp",
            transformation:[{ width: 500, height: 500, crop: "limit" },{quality: "auto"}]
        });
        return result;
    } catch (error) {
         res.status(400).json({ msg: "Error al subir la imagen"});
    }
}

export async function deleteImage(publicId) {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        res.status(400).json({ msg: "Error al eliminar la imagen"});
    }
}






