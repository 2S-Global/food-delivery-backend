import express from "express";
import {
  submitWeeklyMenu,
  getWeeklyMenuByDate,
  getAllWeeklyMenus,
  getMenuByDateAndUser
} from "../controllers/weeklymenuController.js";
import userAuth from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/weekly-menu", submitWeeklyMenu);
router.get("/weekly-menu", getWeeklyMenuByDate); // ?date=YYYY-MM-DD
router.get("/weekly-menu/all", getAllWeeklyMenus);       // Get single survey by ID
router.get("/get-menu-by-date",userAuth, getMenuByDateAndUser); // ?date=YYYY-MM-DD
export default router;
