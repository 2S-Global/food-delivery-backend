import Order from "../models/orderModel.js";
import OrderDetail from "../models/orderDetailsModel.js";
import User from "../models/userModel.js";
import menuModel from "../models/menuModel.js";
import additionalItemModel from "../models/additionalItemModel.js";
import mongoose from "mongoose";

function generateOrderId() {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
  return `ORD-${datePart}-${Date.now()}`;
}

// Add Order API
export const addOrder = async (req, res) => {
  try {
    const { user_id, items } = req.body;

    if (!user_id) {
      return res.status(400).json({ message: "user_id is required" });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "items array is required" });
    }

    // When value will come from frontend
    /*
    const shipping = Number(shipping_amount) || 0;
    const taxAmount = Number(tax) || 0;
    */

    let total_amount = 0;

    // compute totals for each item
    const itemsWithTotals = items.map((item) => {
      const price = Number(item.item_price) || 0;
      const qty = Number(item.item_quantity) || 0;

      const lineTotal = price * qty;
      total_amount += lineTotal;

      return {
        item_id: item.item_id,
        item_details: item.item_details,
        item_quantity: qty,
        total_amount: lineTotal,
        item_price: item.item_price
      };
    });

    const shipping = 50; // fixed shipping charge
    const TAX_RATE = 0.05;
    const taxAmount = Math.round(total_amount * TAX_RATE); // 31

    const grand_total = total_amount + shipping + taxAmount;
    const order_id = generateOrderId();

    // 1) create main order
    const order = await Order.create({
      order_id,
      order_date: new Date(),
      user_id,
      total_amount,
      shipping_amount: shipping,
      tax: taxAmount,
      grand_total,
      status: "PLACED",
      is_del: false
    });

    // 2) create order details for each item
    const orderDetailsDocs = itemsWithTotals.map((item) => ({
      order_id,
      item_id: item.item_id,
      item_details: item.item_details,
      item_price: item.item_price,
      item_quantity: item.item_quantity,
      total_amount: item.total_amount
    }));

    const orderDetails = await OrderDetail.insertMany(orderDetailsDocs);

    return res.status(200).json({
      message: "Order created successfully",
      order,
      items: orderDetails
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error saving order.",
      error: error.message,
    });
  }
};

// List All Order API
export const listAllOrder = async (req, res) => {
  try {
    // Fetch all users with role 1 and not deleted
    const allOrders = await Order.find({ isDel: false }).populate("user_id");
    console.log("Here I am getting all Orders: ", allOrders);

    // If no data found
    if (!allOrders.length) {
      return res.status(404).json({
        success: false,
        message: "No Order List found"
      });
    }

    // Map data before sending
    const formattedOrders = allOrders.map((order) => {
      const formattedDate = order.createdAt.toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      return {
        _id: order._id,
        orderId: order.order_id,
        customer: order.user_id?.name || "Unknown",
        customerEmail: order.user_id?.email || "Unknown",
        customerPhone: order.user_id?.phone_number || "Unknown",
        date: formattedDate,
        total: order.total_amount,
        shipping_amount: order.shipping_amount,
        tax: order.tax,
        grand_total: order.grand_total,
        isDel: order.isDel,
        status: order.status,
      };
    });

    // Success response
    return res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      data: formattedOrders,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching Orders",
      error: error.message
    });
  }
};

// Delete Order API
export const deleteOrder = async (req, res) => {
  try {
    const { _id } = req.query;

    console.log("Delete Order ID:", _id);

    // Validate and convert companyId to ObjectId
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res
        .status(400)
        .json({ success: false, message: `Invalid Order ID` });
    }

    const objectId = new mongoose.Types.ObjectId(_id);

    // Find and update the company
    const deletedOrder = await Order.findOneAndUpdate(
      { _id: objectId, isDel: false },
      { isDel: true, updatedAt: new Date() },
      { new: true }
    );

    if (!deletedOrder) {
      return res.status(404).json({
        success: false,
        message: `Order not found or already deleted`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Order deleted successfully`,
      data: deletedOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting Order",
      error: error.message,
    });
  }
};

// List All Order Items API
export const listOrderItems = async (req, res) => {
  try {
    const { order_id } = req.query;
    console.log("Here is present my order_id: ", order_id);
    // Fetch all users with role 1 and not deleted
    const allOrderItems = await OrderDetail.find({ order_id: order_id, isDel: false });
    console.log("Here I am getting all Order Items: ", allOrderItems);

    // If no data found
    if (!allOrderItems.length) {
      return res.status(404).json({
        success: false,
        message: "Order Items not found"
      });
    }

    // Map data before sending
    /*
    const formattedOrders = allOrders.map((order) => {
      const formattedDate = order.createdAt.toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      return {
        _id: order._id,
        orderId: order.order_id,
        customer: order.user_id?.name || "Unknown",
        customerEmail: order.user_id?.email || "Unknown",
        customerPhone: order.user_id?.phone_number || "Unknown",
        date: formattedDate,
        total: order.grand_total,
        shipping_amount: order.shipping_amount,
        tax: order.tax,
        grand_total: order.grand_total,
        isDel: order.isDel,
        status: order.status,
      };
    });  */

    // Success response
    return res.status(200).json({
      success: true,
      message: "Order Items fetched successfully !",
      data: allOrderItems,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching Orders",
      error: error.message
    });
  }
};

// Get Order Summary
export const getOrderSummary = async (req, res) => {
  try {

    const [
      totalOrders,
      totalMenus,
      totalCustomers,
      totalDeliveryBoys,
      totalAdditionalItems,
      revenueAgg,
    ] = await Promise.all([
      Order.countDocuments({ isDel: false }),
      menuModel.countDocuments({ isDel: false }),
      User.countDocuments({
      role: 1,
      is_del: false,
      user_type: "customer",
    }),
      User.countDocuments({
      role: 2,
      is_del: false,
      user_type: "delivery_boy",
    }),
      additionalItemModel.countDocuments({ isDel: false }),
      Order.aggregate([
        {
          $match: {
            isDel: false,
            status: { $ne: "CANCELLED" }, // ignore cancelled orders
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$grand_total" },
          },
        },
      ]),
    ]);

    const totalRevenue = revenueAgg?.[0]?.totalRevenue || 0;

    return res.status(200).json({
      success: true,
      message: "Order Summary fetched successfully!",
      data: {
        totalOrders,
        totalMenus,
        totalRevenue,
        totalCustomers,
        totalDeliveryBoys,
        totalAdditionalItems,
      },
    });
  } catch (error) {
    console.error("Error in getOrderSummary:", error);

    return res.status(500).json({
      success: false,
      message: "Error fetching Order Summary",
      error: error.message,
    });
  }
};

// Get Orders Chart By Status
export const OrdersChartByStatus = async (req, res) => {
  try {
    const result = await Order.aggregate([
      {
        $match: {
          isDel: false, // ignore soft-deleted
        },
      },
      {
        $group: {
          _id: "$status",           // group by status
          orderCount: { $sum: 1 },  // count docs in each group
        },
      },
      {
        $sort: { _id: 1 },          // sort by status name (optional)
      },
    ]);

    // Format response as { status, orderCount }
    const data = result.map((item) => ({
      status: item._id,
      orderCount: item.orderCount,
    }));

    return res.status(200).json({
      success: true,
      message: "Orders by status fetched successfully!",
      data,
    });
  } catch (error) {
    console.error("Error in getOrdersByStatus:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching orders by status",
      error: error.message,
    });
  }
};