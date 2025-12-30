import express from "express";
import {
  submitWeeklyMenu,
  getWeeklyMenuByDate,
  getAllWeeklyMenus,
} from "../controllers/weeklymenuController.js";

const router = express.Router();

router.post("/weekly-menu", submitWeeklyMenu);
router.get("/weekly-menu", getWeeklyMenuByDate); // ?date=YYYY-MM-DD
router.get("/weekly-menu/all", getAllWeeklyMenus);       // Get single survey by ID
export default router;
