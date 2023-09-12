import Product from "../models/Product.js";
import { uploadImage, deleteImage } from "../config/cloudinary.js";
import fs from "fs-extra"
import path from "path"

const addProduct = async (req, res) => {
  const { name, products, subTotal, percentage, profit, total } = JSON.parse(req.body.jsonData);

  if(name.trim() === "" || !Array.isArray(products) || products.length === 0){
    const error = new Error("Existen campos vacios o Se requiere al menos 1 producto");
    return res.status(400).json({ msg: error.message });
  }

  const existingProduct = await Product.findOne({ name });
  if (existingProduct) {
     res.status(400).json({ msg: "La canasta ya existe", name });
     return
  }

  const productData = {
    name,
    seller: req.seller._id,
    products,
    subTotal,
    percentage,
    profit,
    total
  };
  
  if (req.files?.image && req.files.image.mimetype.startsWith('image/')) {
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif','.tiff', '.webp', '.svg', '.ico','.avif']; 
    const fileExtension = path.extname(req.files.image.name).toLowerCase();
    if (allowedExtensions.includes(fileExtension)) {
      const result = await uploadImage(req.files.image.tempFilePath);
      productData.image = {
        public_id: result.public_id,
        secure_url: result.secure_url
      };
    } else {
      res.status(400).json({ msg: "Imagen no válido" });
      return 
    }
  }

  const product = new Product(productData)
  try {
    const savedProduct = await product.save();
    res.json(savedProduct);
    if(req.files?.image){
      await fs.unlink(req.files.image.tempFilePath)
    }
  } catch (error) {
    console.log(error, "error")
    res.status(500).json({ msg: "Error al crear canasta"});
    if(req.files?.image){
      await deleteImage(product.image.public_id)
      await fs.unlink(req.files.image.tempFilePath)
    }
  }
}; 

const getProducts = async (req, res) => {
  try {
    const product = await Product.find().where("seller").equals(req.seller);
    res.json(product);
  } catch (error) {
    console.log(error)
    return res.status(500).json({ msg: "Error interno del servidor" });
  }
};

const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (id.length !== 24) {
      return res.status(403).json({ msg: "No Encontrado" });
    }
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ msg: "No Encontrado" });
    }

    if (product.seller._id.toString() !== req.seller._id.toString()){
      return res.json({ msg: "Accion no valida" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error en getProduct:", error);
    return res.status(500).json({ msg: "Error interno del servidor" });
  }
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, subtotal, profit, total, percentage, products } = JSON.parse(req.body.jsonData);
 
  if(name.trim() === "" || !Array.isArray(products) || products.length === 0){
    const error = new Error("Existen campos vacios o Se requiere al menos 1 producto");
    return res.status(400).json({ msg: error.message });
  }
  
  if (id.length !== 24) {
    return res.status(403).json({ msg: "No Encontrado" });
  }

  const product = await Product.findById(id);

  if (!product) {
    return res.status(404).json({ msg: "No Encontrado" });
  }

  if (product.seller._id.toString() !== req.seller._id.toString()) {
    return res.json({ msg: "Accion no valida" });
  }

  const existingProduct = await Product.findOne({ name });
  if (existingProduct && existingProduct._id.toString() !== id) {
    return res.status(400).json({ msg: "La canasta ya existe", name });
  }

  product.name = name || product.name
  //image
  if (req.files?.image && req.files.image.mimetype.startsWith('image/')) {
    const fileExtension = path.extname(req.files.image.name).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.tiff', '.webp', '.svg', '.ico', '.avif'];

    if (!allowedExtensions.includes(fileExtension)) {
      return res.status(400).json({ msg: "Extensión de archivo no permitida" });
    }
  
    try {  
      if (product.image?.public_id) {
        await deleteImage(product.image.public_id);
      }

      const result = await uploadImage(req.files.image.tempFilePath);
      product.image = {
        public_id: result.public_id,
        secure_url: result.secure_url,
      };
      
      await fs.unlink(req.files.image.tempFilePath);
    } catch (error) {
      return res.status(500).json({ msg: "Error al actualizar la imagen" });
    }
  } 

  if (!req.files && !req.body.image.startsWith("https") && product.image?.public_id) {
    await deleteImage(product.image.public_id);
    product.image = null;
  }

  //products
  if (products && Array.isArray(products)) {
    product.products = products.map(updatedProduct => {
      const existingProduct = product.products.find(p => p._id.equals(updatedProduct._id));
      if (existingProduct) {
        return {
          ...existingProduct,
          ...updatedProduct
        };
      }
      return updatedProduct;
    });
  } else {
    res.status(500).json({ msg: "Error en products"});
  }
 
  product.subtotal = (percentage !== undefined) ? subtotal : product.subtotal;
  product.percentage = (percentage !== undefined) ? percentage : product.percentage;
  product.profit = (profit !== undefined) ? profit : product.profit;
  product.total = (total !== undefined) ? total : product.total;

  try {
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.log(error)
    res.status(500).json({ msg: "Error al guardar la canasta"});
  }
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;

  if (id.length !== 24) {
    return res.status(403).json({ msg: "No Encontrado" });
  }

  const product = await Product.findById(id);

  if (!product) {
    return res.status(404).json({ msg: "No Encontrado" });
  }

  if (product.seller._id.toString() !== req.seller._id.toString()) {
    return res.json({ msg: "Acción no válida" });
  }

  try {
    if(product.image.public_id){
      await deleteImage(product.image.public_id)
    }
    await product.deleteOne();
    res.json({ msg: "Canasta eliminada" });
  } catch (error) {
    return res.status(500).json({ msg: "Error al eliminar el producto" });
  }
};

export { addProduct, getProducts, getProduct, updateProduct, deleteProduct };