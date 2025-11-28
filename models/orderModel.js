import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
    {
        // Business order ID shown to admin/user (e.g. "ORD-20251128-123456")
        order_id: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        // When order was created
        order_date: {
            type: Date,
            required: true,
            default: Date.now,
        },

        // Reference to user who placed the order
        // If you don't have User model, change to: type: String
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Sum of all item line totals (without tax & shipping)
        total_amount: {
            type: Number,
            required: true,
            default: 0,
        },

        // Delivery / shipping charge
        shipping_amount: {
            type: Number,
            required: true,
            default: 0,
        },

        // Tax amount
        tax: {
            type: Number,
            required: true,
            default: 0,
        },

        // Final amount to be paid: total_amount + shipping_amount + tax
        grand_total: {
            type: Number,
            required: true,
            default: 0,
        },

        // Current status of order
        status: {
            type: String,
            enum: [
                "PLACED",
                "CONFIRMED",
                "PREPARING",
                "OUT_FOR_DELIVERY",
                "DELIVERED",
                "CANCELLED",
            ],
            default: "PLACED",
        },

        isDel: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Order", OrderSchema);