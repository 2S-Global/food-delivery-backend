import mongoose from "mongoose";

const userSubscriptionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        
        subscriptionType: {
            type: String,
            enum: ["VEG", "NON_VEG"],
            required: true,
        },

        planDurationWeeks: {
            type: Number,
            // enum: [1, 2, 3, 4, 5],
            required: true,
        },

        startDate: {
            type: Date,
            required: true,
        },

        endDate: {
            type: Date,
            required: true,
        },

        status: {
            type: String,
            enum: ["ACTIVE", "PAUSED", "EXPIRED"],
            default: "ACTIVE",
        },

        isDel: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export default mongoose.model("UserSubscription", userSubscriptionSchema);