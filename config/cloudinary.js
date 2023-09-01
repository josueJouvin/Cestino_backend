import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_KEY, 
    api_secret: process.env.CLOUDINARY_SECRET,
    secure: true
});

// Función para subir una imagen a Cloudinary
export async function uploadImage(filePath) {
    console.log(filePath)
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

// Función para eliminar una imagen de Cloudinary
export async function deleteImage(publicId) {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        res.status(400).json({ msg: "Error al eliminar la imagen"});
    }
}






