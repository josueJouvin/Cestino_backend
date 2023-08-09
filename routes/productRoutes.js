import express from "express";
import {
  addProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import checkAuth from "../middleware/authMiddleware.js";

const router = express.Router();
router.route("/").post(checkAuth, addProduct).get(checkAuth, getProducts);
router
  .route("/:id")
  .get(checkAuth, getProduct)
  .put(checkAuth, updateProduct)
  .delete(checkAuth, deleteProduct);
export default router;
