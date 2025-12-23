import menuModel from "../models/menuModel.js";
import additionalItemModel from "../models/additionalItemModel.js";
import SubscriptionPrice from "../models/subscriptionPriceModel.js";
import mongoose from "mongoose";

// List all user Menu
export const listUserMenu = async (req, res) => {
  try {
    const { type } = req.query;

    let data = [];

    // CASE 1: VEG MENU
    if (type === "veg") {
      data = await menuModel.find({
        menuType: "Veg",
        isDel: false,
      });

      // CASE 2: NON-VEG MENU
    } else if (type === "non-veg") {
      data = await menuModel.find({
        menuType: "Non-Veg",
        isDel: false,
      });

      // CASE 3: ADDITIONAL ITEMS
    } else if (type === "additional-items") {
      data = await additionalItemModel.find({
        isDel: false,
      });

      // CASE 4: INVALID TYPE
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid type. Allowed values: veg, non-veg, additional-items",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User menu fetched successfully",
      data,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching user menu",
      error: error.message,
    });
  }
};

// List Item Details
export const getItemDetailsById = async (req, res) => {
  try {
    const { id } = req.query;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }

    // Try Menu collection first
    let item = await menuModel.findOne({
      _id: id,
      isDel: false,
    });

    let source = "MENU";

    // If not found, try AdditionalItem collection
    if (!item) {
      item = await additionalItemModel.findOne({
        _id: id,
        isDel: false,
      });
      source = "ADDITIONAL_ITEM";
    }

    // If still not found
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Item details fetched successfully",
      source, // tells frontend where it came from
      data: item,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching item details",
      error: error.message,
    });
  }
};

// Add Subscription Price
export const addSubscriptionPrice = async (req, res) => {
  try {
    const { veg_price, non_veg_price } = req.body;

    // If nothing provided
    if (veg_price == null && non_veg_price == null) {
      return res.status(400).json({
        success: false,
        message: "At least one price is required (vegPrice or nonVegPrice)",
      });
    }

    // Validation
    if (non_veg_price < 0 || non_veg_price < 0) {
      return res.status(400).json({
        success: false,
        message: "Price cannot be negative",
      });
    }

    // check existing active price
    let activePrice = await SubscriptionPrice.findOne({
      isActive: true,
      isDel: false,
    });

    // If exists → update only fields provided
    if (activePrice) {
      if (veg_price != null) activePrice.vegPrice = veg_price;
      if (non_veg_price != null) activePrice.nonVegPrice = non_veg_price;

      activePrice = await activePrice.save();

      return res.status(200).json({
        success: true,
        message: "Subscription price updated successfully",
        data: activePrice,
      });
    }

    // No active price exists → create new
    const newPrice = new SubscriptionPrice({
      vegPrice: veg_price ?? 0,
      nonVegPrice: non_veg_price ?? 0,
    });

    await newPrice.save();

    res.status(201).json({
      success: true,
      message: "New subscription price added successfully",
      data: newPrice,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add/update price",
      error: error.message,
    });
  }
};

// List Meal Types API
export const listMealType = async (req, res) => {
  try {
    // Fetch first Veg menu
    const vegMenu = await menuModel.findOne({
      menuType: "Veg",
      isDel: false,
    });

    // Fetch first Non-Veg menu
    const nonVegMenu = await menuModel.findOne({
      menuType: "Non-Veg",
      isDel: false,
    });

    // Fetch first Additional Item
    const additionalItem = await additionalItemModel.findOne({
      isDel: false,
    });

    return res.status(200).json({
      success: true,
      message: "User menu fetched successfully",
      data: {
        veg: vegMenu || null,
        non_veg: nonVegMenu || null,
        additional_item: additionalItem || null,
      },
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching user menu",
      error: error.message,
    });
  }
};
