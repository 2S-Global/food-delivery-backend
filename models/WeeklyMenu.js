import mongoose from "mongoose";

const WeeklyMenuSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      unique: true,
    },

    day: {
      type: String,
      required: true,
    },

    vegLunch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Menu",
      required: true,
    },

    vegDinner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Menu",
    },

    nonVegLunch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Menu",
      required: true,
    },

    nonVegDinner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Menu",
    },
  },
  { timestamps: true }
);

export default mongoose.model("WeeklyMenu", WeeklyMenuSchema);
