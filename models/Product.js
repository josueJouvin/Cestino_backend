import mongoose from "mongoose";

const productSchema = mongoose.Schema(
  {
    image: {
      type: String,
      require: false,
    },
    name: {
      type: String,
      require: true,
      unique: true
    },
    products: [
      {
        nameproduct: {
          type: String,
          required: true,
          unique:true 
        },
        quantity: {
          type: Number,
          required: true
        },
        unitmeasure:{
          type: String,
          require: true
        },
        price: {
          type: Number,
          required: true
        },
      },
    ],
    subTotal: {
      type: Number,
      require: true,
    },
    percentage:{
      type: Number,
      require: true
    },
    profit: {
      type: Number,
      require: true,
    },
    total: {
      type: Number,
      require: true,
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
