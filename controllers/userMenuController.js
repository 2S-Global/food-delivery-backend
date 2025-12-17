import menuModel from "../models/menuModel.js";
import additionalItemModel from "../models/additionalItemModel.js";
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
