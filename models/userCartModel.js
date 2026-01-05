// models/Cart.js
import mongoose from "mongoose";

const userCartSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    items: [
      {
        // 🔹 NEW (minimal addition)
        item_type: {
          type: String,
          enum: ["subscription", "additional_item"],
          required: true,
        },

        // ===== Subscription fields (UNCHANGED) =====
        subscription_type: {
          type: String,
          enum: ["veg", "non_veg"],
          required: function () {
            return this.item_type === "subscription";
          },
        },

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

        weeks: {
          type: Number,
          min: 1,
          required: function () {
            return this.item_type === "subscription";
          },
        },

        days: {
          type: Number,
          min: 0,
          required: function () {
            return this.item_type === "subscription";
          },
        },
        meal_count: {
          type: Number,
          required: function () {
            return this.item_type === "subscription";
          },
        },

        // ===== Additional items (MOVED, not deleted) =====
        additional_items: {
          type: [
            {
              item_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "AdditionalItem",
                required: true,
              },
              quantity: {
                type: Number,
                default: 1,
              },
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
          default: undefined,
          required: function () {
            return this.item_type === "additional_item";
          },
        },

        total_price: {
          type: Number,
          required: true,
        },
      },
    ],

    total_cart_amount: {
      type: Number,
      default: 0,
    }

  },
  { timestamps: true }
);

const UserCart = mongoose.model("UserCart", userCartSchema);

export default UserCart;