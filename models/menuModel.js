import mongoose from "mongoose";

const menuSchema = new mongoose.Schema(
  {
    menuName: {
      type: String,
      required: true,
      trim: true,
    },

    menuType: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    images: {
      type: [String],
      required: true,
    },

    dayType: {
      type: String,
      required: true,
      enum: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ],
    },

    mealType: {
      type: String,
      required: true,
    },
    isDel: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Menu", menuSchema);