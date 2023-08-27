import {v2 as cloudinary} from "cloudinary"
import dotenv from "dotenv"

dotenv.config()
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_KEY, 
    api_secret: process.env.CLOUDINARY_SECRET,
    secure: true
  });

export async function uploadImage(filePaht) {
    return await cloudinary.uploader.upload(filePaht,{
        folder: "cestino"
    })
}

export async function deleteImage(publicId) {
    return await cloudinary.uploader.destroy(publicId)
}