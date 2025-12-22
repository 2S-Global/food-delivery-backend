// models/Cart.js
import mongoose from "mongoose";

const userCartSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
      unique: true,          // recommended
    },
    items: [
      {
        subscription_type: {
          type: String,
          enum: ["veg", "non-veg"],
          required: true,
        },

        start_date: { type: Date, required: true },

        end_date: { type: Date, required: true },

        weeks: {
          type: Number,
          required: true,
          min: 1,
        },

        meal_count: {
          type: Number,
          required: true,
        },
        additional_items: [
          {
            item_id: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "AdditionalItem",
            },
            quantity: {
              type: Number,
              default: 1,
            },
          },
        ],
        total_price: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);


const UserCart = mongoose.model("UserCart", userCartSchema);

export default UserCart;