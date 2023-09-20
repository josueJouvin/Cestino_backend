import Product from "../models/Product.js";
import { deleteImage } from "../config/cloudinary.js";
import { imageValid } from "../helpers/imageValid.js"
import fs from "fs-extra"
import { imageUpdated } from "../helpers/updatedImage.js";

const addProduct = async (req, res) => {
  const { name, products, subTotal, percentage, profit, total } = JSON.parse(req.body.jsonData);

  if(name.trim() === "" || !Array.isArray(products) || products.length === 0){
    const error = new Error("Existen campos vacios o Se requiere al menos 1 producto");
    return res.status(400).json({ msg: error.message });
  }

  const existingProduct = await Product.findOne({ name });
  if (existingProduct) {
    if(req.files?.image){
      await fs.unlink(req.files.image.tempFilePath)
    }
    return res.status(400).json({ msg: `La canasta ${name} ya existe`, name });
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

  const imageInfo = await imageValid(res, req.files?.image);
  if(imageInfo){
    productData.image = imageInfo
  }

  const product = new Product(productData)
  try {
    const savedProduct = await product.save();
    res.json(savedProduct);
  } catch (error) {
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
    return res.status(400).json({ msg: `La canasta ${name} ya existe`, name });
  }

  product.name = name || product.name

  //image
  await imageUpdated(res, product, req.files?.image, req)

  if(!product && !Array.isArray(products)) {
    return res.status(500).json({ msg: "Error en products" });
  }

  const existingProductsMap = {};
  product.products.forEach(existingProduct => {
    existingProductsMap[existingProduct._id] = existingProduct;
  });

  const updatedProducts = products.map(updatedProduct => {
    const existingProduct = existingProductsMap[updatedProduct._id];
    if (existingProduct) {
      return {
        ...existingProduct,
        ...updatedProduct
      };
    }
    return updatedProduct;
  });

  product.products = updatedProducts;
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

  if(product.image.public_id){
    await deleteImage(product.image.public_id)
  }
  try {
    await product.deleteOne();
    res.json({ msg: "Canasta eliminada" });
  } catch (error) {
    return res.status(500).json({ msg: "Error al eliminar el producto" });
  }
};

export { addProduct, getProducts, getProduct, updateProduct, deleteProduct };