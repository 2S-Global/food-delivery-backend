// models/WeeklyMenu.js
import mongoose from "mongoose";

const WeeklyMenuSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true, unique: true }, // unique per date
    day: { type: String, required: true }, // Monday, Tuesday...
    vegLunch: { type: String, required: true },
    vegDinner: { type: String },
    nonVegLunch: { type: String, required: true },
    nonVegDinner: { type: String },
  },
  { timestamps: true }
);


const WeeklyMenu = mongoose.model('weekly_menu',  WeeklyMenuSchema);

export default WeeklyMenu;

