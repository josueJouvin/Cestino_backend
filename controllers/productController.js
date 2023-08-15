import Product from "../models/Product.js";

const addProduct = async (req, res) => {
  const product = new Product(req.body);
  product.seller = req.seller._id;

  try {
    const savedProduct = await product.save();
    res.json(savedProduct);
  } catch (error) {
    console.log(error);
  }
};

const getProducts = async (req, res) => {
  const product = await Product.find().where("seller").equals(req.seller);
  res.json(product);
};

const getProduct = async (req, res) => {
  const { id } = req.params;
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

  res.json(product);
};

const updateProduct = async (req, res) => {
  const { id } = req.params;

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

  product.image = req.body.image || product.image;
  product.name = req.body.name || product.name;

  // Mapeo de IDs de productos existentes
  const productIdMap = new Map();
  product.products.forEach((prod, index) => {
    productIdMap.set(prod._id.toString(), index);
  });

  // Actualizar productos internos
  req.body.products.forEach((element) => {
    const existingProductIndex = productIdMap.get(element.productId);

    if (existingProductIndex !== undefined) {
      const existingProduct = product.products[existingProductIndex];
      existingProduct.nameproduct = element.nameproduct || existingProduct.nameproduct;
      existingProduct.quantity = element.quantity || existingProduct.quantity;
      existingProduct.price = element.price || existingProduct.price;
    } else {
      const newProduct = {
        nameproduct: element.nameproduct,
        quantity: element.quantity,
        price: element.price,
      };
      product.products.push(newProduct);
    }
  });

  product.subtotal = req.body.subtotal || product.subtotal;
  product.profit = req.body.profit || product.profit;
  product.total = req.body.total || product.total;

  try {
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error interno del servidor" });
  }
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;
  const { productsId } = req.body;

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

  if (productsId && Array.isArray(productsId) && productsId.length > 0) {
    const productsToRemove = product.products.filter(prod => productsId.includes(prod._id.toString()));
  
    if (productsToRemove.length > 0) {
      product.products = product.products.filter(prod => !productsId.includes(prod._id.toString()));
      await product.save();
      return res.json({ msg: "Productos eliminados" });
    } else {
      return res.status(404).json({ msg: "Productos no encontrados" });
    }
  }

  try {
    await product.deleteOne();
    res.json({ msg: "Producto eliminado" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Error al eliminar el producto" });
  }
};

export { addProduct, getProducts, getProduct, updateProduct, deleteProduct };
