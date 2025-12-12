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

    item_type: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    item1: {
      type: String,
      trim: true,
    },

    description1: {
      type: String,
      trim: true,
    },

    item2: {
      type: String,
      trim: true,
    },

    description2: {
      type: String,
      trim: true,
    },

    item3: {
      type: String,
      trim: true,
    },

    description3: {
      type: String,
      trim: true,
    },

    item4: {
      type: String,
      trim: true,
    },

    description4: {
      type: String,
      trim: true,
    },

    images: {
      type: [String],
      required: true,
    },

    // dayType: {
    //   type: String,
    //   required: true,
    //   enum: [
    //     "Monday",
    //     "Tuesday",
    //     "Wednesday",
    //     "Thursday",
    //     "Friday",
    //     "Saturday",
    //   ],
    // },

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