import multer from "multer";
import path from "path"

export const upload = multer({
    storage: multer.diskStorage({}),
    fileFilter:(req, file, cb) => {
        const allowedExtensions = ['.png', '.webp', '.gif', '.jpg', '.jpeg', ".avif", ".svg", ".PNG", ".JPG", ".WEBP", ".GIF", ".JPEG", ".AVIF", ".SVG"];
        let ext = path.extname(file.originalname)
        
        if (!allowedExtensions.includes(ext)) {
            cb(new Error('Formato de archivo no válido. Solo se permiten archivos de imagen.'), false);
            return
        } 
        
        cb(null, true); // Aceptar el archivo
        
    }
})
