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
              addon_schedule_type: {
                type: String,
                enum: [
                  "daily",
                  "alternate",
                  "every_3_days",
                  "weekly",
                  "monthly",
                ],
                required: true,
              },
            },
          ],
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
  },
  { timestamps: true }
);

const UserCart = mongoose.model("UserCart", userCartSchema);

export default UserCart;