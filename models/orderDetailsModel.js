import mongoose from "mongoose";

const OrderDetailsSchema = new mongoose.Schema(
    {
        // Same order_id that is stored in Orders collection
        order_id: {
            type: String,
            required: true,
            trim: true,
        },

        // ID of the item (food/product)
        // If you don't have Item collection, change type to String
        item_id: {
            type: String,
            required: true,
        },

        // Name + size/flavour/custom text of item
        item_details: {
            type: String,
            required: true,
            trim: true,
        },

        // How many of this item were ordered
        item_quantity: {
            type: Number,
            required: true,
            min: 1,
        },

        // Total for this line = item_quantity * item_price
        total_amount: {
            type: Number,
            required: true,
            default: 0,
        },

        isDel: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export default mongoose.model("OrderDetails", OrderDetailsSchema);