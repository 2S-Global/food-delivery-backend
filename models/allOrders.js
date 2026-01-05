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
        item_type: {
          type: String,
          enum: ["subscription", "additional_item"],
          required: true,
        },
        subscription_type: { type: String },      // veg / non-veg etc
        weeks: { type: Number },
        days: { type: Number },
        start_date: {
          type: Date,
          required: function () {
            return this.item_type === "subscription";
          },
        },

        end_date: {
          type: Date,
          required: function () {
            return this.item_type === "subscription";
          },
        },
        meal_count: { type: Number },
        additional_items: [
          {
            item_id: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "AdditionalItem",
            },
            quantity: { type: Number, default: 1 },
            addon_start_date: {
              type: Date,
              required: true,
            },
            addon_end_date: {
              type: Date,
              required: true,
            },
            addon_schedule_type: {
              type: String,
              enum: [
                "daily",
                "alternate",
                "every_3_days",
                "weekly",
                "monthly",
                "once",
              ],
              required: true,
            },
            delivery_dates: {
              type: [String],
              required: true,
            },
            delivery_count: {
              type: Number,
              min: 1,
              required: true,
            },
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