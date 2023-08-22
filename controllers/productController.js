import Product from "../models/Product.js";

const addProduct = async (req, res) => {
  const product = new Product(req.body);
  product.seller = req.seller._id;

  try {
    const savedProduct = await product.save();
    res.json(savedProduct);
  } catch (error) {
    res.status(500).json({ error: "Este producto ya ha sido registrado"});

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
  const {name, subtotal, profit, total, percentage, products} = req.body

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
  if (products && Array.isArray(products)) {
    // Actualizar productos internos (si es necesario)
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
  }


  product.subtotal = subtotal || product.subtotal;
  product.percentage = percentage || product.percentage
  product.profit = profit || product.profit;
  product.total = total || product.total;

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
    await product.deleteOne();
    res.json({ msg: "Producto eliminado" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Error al eliminar el producto" });
  }
};

export { addProduct, getProducts, getProduct, updateProduct, deleteProduct };
