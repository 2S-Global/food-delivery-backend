import WeeklyMenu from "../models/WeeklyMenu.js";
import allOrdersData from "../models/allOrders.js";
import mongoose from "mongoose";

/* =========================
   CREATE / UPDATE WEEKLY MENU
========================= */
export const submitWeeklyMenu = async (req, res) => {
  try {
    const {
      date,
      day,
      vegLunch,
      vegDinner,
      nonVegLunch,
      nonVegDinner,
    } = req.body;

    if (!date || !day || !vegLunch || !nonVegLunch) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    const formattedDate = new Date(date);
    formattedDate.setHours(0, 0, 0, 0);

    const existingMenu = await WeeklyMenu.findOne({ date: formattedDate });

    // ✅ UPDATE
    if (existingMenu) {
      existingMenu.day = day;
      existingMenu.vegLunch = vegLunch;
      existingMenu.vegDinner = vegDinner || null;
      existingMenu.nonVegLunch = nonVegLunch;
      existingMenu.nonVegDinner = nonVegDinner || null;

      await existingMenu.save();

      return res.status(200).json({
        success: true,
        message: "Weekly menu updated successfully",
        data: existingMenu,
      });
    }

    // ✅ INSERT
    const newMenu = await WeeklyMenu.create({
      date: formattedDate,
      day,
      vegLunch,
      vegDinner,
      nonVegLunch,
      nonVegDinner,
    });

    res.status(201).json({
      success: true,
      message: "Weekly menu created successfully",
      data: newMenu,
    });
  } catch (error) {
    console.error("Weekly menu submit error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save weekly menu",
    });
  }
};

/* =========================
   GET WEEKLY MENU BY DATE
========================= */
export const getWeeklyMenuByDate = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    const formattedDate = new Date(date);
    formattedDate.setHours(0, 0, 0, 0);

    const menu = await WeeklyMenu.findOne({ date: formattedDate })
      .populate("vegLunch vegDinner nonVegLunch nonVegDinner");

    if (!menu) {
      return res.status(200).json({
        success: true,
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      data: menu,
    });
  } catch (error) {
    console.error("Fetch weekly menu error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch weekly menu",
    });
  }
};

/* =========================
   GET ALL WEEKLY MENUS
========================= */
export const getAllWeeklyMenus = async (req, res) => {
  try {
    const menus = await WeeklyMenu.find()
      .sort({ date: -1 })
      .populate("vegLunch vegDinner nonVegLunch nonVegDinner");

    res.status(200).json({
      success: true,
      count: menus.length,
      data: menus,
    });
  } catch (error) {
    console.error("Fetch all weekly menus error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch weekly menus",
    });
  }
};


/* =========================
   GET MENU BY DATE
========================= */
export const getMenuByDateAndUser = async (req, res) => {
  try {

    const userId = req.userId;
    const { date } = req.query;

    console.log("User ID:", userId);

    console.log("Date:", date);

    if (!userId || !date) {
      return res.status(400).json({
        success: false,
        message: "userId and date are required",
      });
    }

    // Normalize date (00:00:00)
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    /* =========================
       1. FIND USER ORDER
    ========================= */
    const order = await allOrdersData.findOne({
      user_id: userId,
      items: {
        $elemMatch: {
          start_date: { $lte: selectedDate },
          end_date: { $gte: selectedDate },
        },
      },
      payment_status: "paid",
    });

    if (!order) {
      return res.status(200).json({
        success: true,
        hasOrder: false,
        message: "No active subscription for this date",
        data: null,
      });
    }

    /* =========================
       2. GET SUBSCRIPTION TYPE
    ========================= */
    const activeItem = order.items.find(
      (item) =>
        selectedDate >= new Date(item.start_date) &&
        selectedDate <= new Date(item.end_date)
    );

    if (!activeItem) {
      return res.status(200).json({
        success: true,
        hasOrder: false,
        data: null,
      });
    }

    const subscriptionType = activeItem.subscription_type; // veg / nonveg

    /* =========================
       3. FETCH WEEKLY MENU
    ========================= */
    const weeklyMenu = await WeeklyMenu.findOne({ date: selectedDate })
      .populate(
        subscriptionType === "veg"
          ? "vegLunch vegDinner"
          : "nonVegLunch nonVegDinner"
      );

    if (!weeklyMenu) {
      return res.status(200).json({
        success: true,
        hasOrder: true,
        data: null,
        message: "Menu not published for this date",
      });
    }

    /* =========================
       4. RESPONSE
    ========================= */
    res.status(200).json({
      success: true,
      hasOrder: true,
      subscriptionType,
      orderNumber: order.order_number,
      menu: weeklyMenu,
    });
  } catch (error) {
    console.error("Get menu by date & user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch menu",
    });
  }
};