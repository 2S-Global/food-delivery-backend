import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",       // optional, if using users collection
      required: true,
    },

    items: [
      {
        subscription_type: { type: String },      // veg / non-veg etc
        weeks: { type: Number },
        meal_count: { type: Number },
        additional_items: [
          {
            item_id: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "AdditionalItem",
            },
            quantity: { type: Number, default: 1 },
          },
        ],
        total_price: { type: Number, required: true },
      },
    ],

    total_price: {
      type: Number,
      required: true,
    },

    shipping_address: {
      firstName: String,
      lastName: String,
      email: String,
      phone: String,
      address: String,
      city: String,
      state: String,
      zipCode: String,
    },

    payment_method: {
      type: String,
      enum: ["online", "wallet"],
      required: true,
    },

    payment_status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    payment_id: {
      type: String,     // Razorpay payment id OR null
      default: null,
    },

    order_number: {
      type: String,
      unique: true,
      required: true,
    },

    cardDetails: {
      cardName: String,
      cardNumberMasked: String,  // Only masked
      cardExpiry: String
    },

  },
  { timestamps: true }  // enables createdAt and updatedAt automatically
);

const allOrdersData = mongoose.model("allOrdersData", OrderSchema);

export default allOrdersData;