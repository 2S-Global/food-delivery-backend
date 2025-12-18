import mongoose from "mongoose";

const subscriptionPriceSchema = new mongoose.Schema(
    {
        vegPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        nonVegPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isDel: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true } // automatically manages createdAt and updatedAt
);

const SubscriptionPrice = mongoose.model("SubscriptionPrice", subscriptionPriceSchema);

export default SubscriptionPrice;
