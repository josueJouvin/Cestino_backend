import mongoose from "mongoose";

const productSchema = mongoose.Schema(
  {
    image: {
      type: String,
      required: false,
    },
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    products: [
      {
        nameproduct: {
          type: String,
          required: true, 
          trim: true
        },
        quantity: {
          type: Number,
          required: true
        },
        unitmeasure:{
          type: String,
          required: true
        },
        price: {
          type: Number,
          requiredd: true
        },
      },
    ],
    subTotal: {
      type: Number,
      required: true,
    },
    percentage:{
      type: Number
    },
    profit: {
      type: Number
    },
    total: {
      type: Number,
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);
export default Product;