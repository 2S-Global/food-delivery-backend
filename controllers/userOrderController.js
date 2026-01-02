import AllOrdersData from "../models/allOrders.js";
import mongoose from "mongoose";

export const listUserOrders = async (req, res) => {
  try {
    const userId = req.userId; // coming from auth middleware

    console.log("User ID:", userId);

    const orders = await AllOrdersData.find({
      user_id: userId,
    })
      .sort({ createdAt: -1 }); // latest first

    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: orders,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
};

export const getUserOrderDetails = async (req, res) => {
  try {
    const userId = req.userId;           // from auth middleware
    const { orderId } = req.query;      // order _id

    console.log("User ID:", userId);
    console.log("Order ID:", orderId);

    // Validate orderId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    // Find order belonging to logged-in user
    const order = await AllOrdersData.findOne({
      _id: orderId,
      user_id: userId,
    })
    .populate({
        path: "items.additional_items.item_id",
        select: "itemName itemPrice", // only required fields
      });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order details fetched successfully",
      data: order,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching order details",
      error: error.message,
    });
  }
};
