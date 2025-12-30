import Survey from "../models/WeeklyMenu.js";

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
