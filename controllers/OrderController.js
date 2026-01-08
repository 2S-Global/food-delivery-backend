import Order from "../models/orderModel.js";
import OrderDetail from "../models/orderDetailsModel.js";
import User from "../models/userModel.js";
import menuModel from "../models/menuModel.js";
import additionalItemModel from "../models/additionalItemModel.js";
import UserSubscription from "../models/userSubscriptionModel.js";
import allOrdersData from "../models/allOrders.js";
import WeeklyMenu from "../models/WeeklyMenu.js";
import mongoose from "mongoose";

function generateOrderId() {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
  return `ORD-${datePart}-${Date.now()}`;
}


// Add Order API
export const addOrder123 = async (req, res) => {
  try {
    const { user_id, items } = req.body;

    if (!user_id) {
      return res.status(400).json({ message: "user_id is required" });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "items array is required" });
    }

    // --- collect ids to fetch images in batch ---
    const menuIds = new Set();
    const addonIds = new Set();

    // Frontend should ideally send item_type to indicate source collection.
    // Fallback: if item.item_details contains images, we will use that.
    for (const it of items) {

      // console.log("Loop is running: ");
      const id = it.item_id;
      const type = it.item_type;

      // console.log("Here is my item type: ", type);

      if (!id) continue;
      if (type === 'menu' || type === 'Menu') menuIds.add(id);
      else if (type === 'additional_item' || type === 'Additional_Item') addonIds.add(id);
      // if type missing, we will attempt to find images from item_details later
    }

    // console.log("Here is my all collected Id for menu: ", menuIds);
    // console.log("Here is my all collected Id for additional Item: ", addonIds);

    // Fetch both collections in parallel (only if IDs present)
    const [menus, addons] = await Promise.all([
      menuIds.size ? menuModel.find({ _id: { $in: Array.from(menuIds) } }).lean() : Promise.resolve([]),
      addonIds.size ? additionalItemModel.find({ _id: { $in: Array.from(addonIds) } }).lean() : Promise.resolve([])
    ]);

    // console.log("First result from menus : ", menus);
    // console.log("Sceond result from additional items : ", addons);

    const menuMap = new Map(menus.map(m => [String(m._id), m]));
    const addonMap = new Map(addons.map(a => [String(a._id), a]));

    // console.log("First result from menuMap : ", menuMap);
    // console.log("Sceond result from addonMap : ", addonMap);



    // return;


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
      // order_date: new Date("2025-12-09T10:00:00Z"),
      user_id,
      total_amount,
      shipping_amount: shipping,
      tax: taxAmount,
      grand_total,
      status: "PLACED",
      is_del: false
    });

    // 2) create order details for each item

    /*
    const orderDetailsDocs = itemsWithTotals.map((item) => ({
      order_id,
      item_id: item.item_id,
      item_details: item.item_details,
      item_price: item.item_price,
      item_quantity: item.item_quantity,
      total_amount: item.total_amount
    }));
    */

    // --- build orderDetailsDocs with images/thumbnail copied from DB maps or frontend item_details ---
    const orderDetailsDocs = itemsWithTotals.map((item) => {
      const id = item.item_id;
      // Try to find the source doc first in menuMap then in addonMap
      const menuDoc = menuMap.get(String(id));
      const addonDoc = addonMap.get(String(id));

      // Prefer DB images when available; fallback to frontend-provided item_details.images
      let images = [];
      if (menuDoc && Array.isArray(menuDoc.images) && menuDoc.images.length) {
        images = menuDoc.images;
      } else if (addonDoc && Array.isArray(addonDoc.images) && addonDoc.images.length) {
        images = addonDoc.images;
      } else if (item.item_details && Array.isArray(item.item_details.images) && item.item_details.images.length) {
        images = item.item_details.images;
      }

      // thumbnail is the first image if exists (or null)
      const item_image = images.length ? images[0] : null;

      return {
        order_id,
        item_id: item.item_id,
        item_details: item.item_details,
        item_price: item.item_price,
        item_quantity: item.item_quantity,
        total_amount: item.total_amount,
        images,
        item_image
      };
    });

    console.log("Here is my Order Details Docs: ", orderDetailsDocs);


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

// Add Order API
export const addOrder = async (req, res) => {
  try {
    const { user_id, items } = req.body;

    // extra code added for subscription started ----

    /*
    let activeSubscription = await UserSubscription.findOne({
      userId: user_id,
      status: "ACTIVE",
      endDate: { $gte: new Date() },
    });

    if (!activeSubscription) {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + weeks * 7);

      activeSubscription = await UserSubscription.create({
        userId: user_id,
        mealType,
        planDurationWeeks: weeks,
        startDate,
        endDate,
      });
    }
    */

    // extra code added for subscription ended ----


    if (!user_id) {
      return res.status(400).json({ message: "user_id is required" });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "items array is required" });
    }

    // --- collect ids to fetch images in batch ---
    const menuIds = new Set();
    const addonIds = new Set();

    // Frontend should ideally send item_type to indicate source collection.
    // Fallback: if item.item_details contains images, we will use that.
    for (const it of items) {

      // console.log("Loop is running: ");
      const id = it.item_id;
      const type = it.item_type;

      // console.log("Here is my item type: ", type);

      if (!id) continue;
      if (type === 'menu' || type === 'Menu') menuIds.add(id);
      else if (type === 'additional_item' || type === 'Additional_Item') addonIds.add(id);
      // if type missing, we will attempt to find images from item_details later
    }

    // console.log("Here is my all collected Id for menu: ", menuIds);
    // console.log("Here is my all collected Id for additional Item: ", addonIds);

    // Fetch both collections in parallel (only if IDs present)
    const [menus, addons] = await Promise.all([
      menuIds.size ? menuModel.find({ _id: { $in: Array.from(menuIds) } }).lean() : Promise.resolve([]),
      addonIds.size ? additionalItemModel.find({ _id: { $in: Array.from(addonIds) } }).lean() : Promise.resolve([])
    ]);

    // console.log("First result from menus : ", menus);
    // console.log("Sceond result from additional items : ", addons);

    const menuMap = new Map(menus.map(m => [String(m._id), m]));
    const addonMap = new Map(addons.map(a => [String(a._id), a]));

    // console.log("First result from menuMap : ", menuMap);
    // console.log("Sceond result from addonMap : ", addonMap);



    // return;


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
      // order_date: new Date("2025-12-09T10:00:00Z"),
      user_id,
      total_amount,
      shipping_amount: shipping,
      tax: taxAmount,
      grand_total,
      status: "PLACED",
      is_del: false
    });

    // 2) create order details for each item

    /*
    const orderDetailsDocs = itemsWithTotals.map((item) => ({
      order_id,
      item_id: item.item_id,
      item_details: item.item_details,
      item_price: item.item_price,
      item_quantity: item.item_quantity,
      total_amount: item.total_amount
    }));
    */

    // --- build orderDetailsDocs with images/thumbnail copied from DB maps or frontend item_details ---
    const orderDetailsDocs = itemsWithTotals.map((item) => {
      const id = item.item_id;
      // Try to find the source doc first in menuMap then in addonMap
      const menuDoc = menuMap.get(String(id));
      const addonDoc = addonMap.get(String(id));

      // Prefer DB images when available; fallback to frontend-provided item_details.images
      let images = [];
      if (menuDoc && Array.isArray(menuDoc.images) && menuDoc.images.length) {
        images = menuDoc.images;
      } else if (addonDoc && Array.isArray(addonDoc.images) && addonDoc.images.length) {
        images = addonDoc.images;
      } else if (item.item_details && Array.isArray(item.item_details.images) && item.item_details.images.length) {
        images = item.item_details.images;
      }

      // thumbnail is the first image if exists (or null)
      const item_image = images.length ? images[0] : null;

      return {
        order_id,
        item_id: item.item_id,
        item_details: item.item_details,
        item_price: item.item_price,
        item_quantity: item.item_quantity,
        total_amount: item.total_amount,
        images,
        item_image
      };
    });

    console.log("Here is my Order Details Docs: ", orderDetailsDocs);


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

// Get Revenue By Status
export const RevenueByStatus = async (req, res) => {
  try {
    const result = await Order.aggregate([
      {
        $match: {
          isDel: false,
        },
      },
      {
        $group: {
          _id: "$status",
          totalRevenue: { $sum: "$grand_total" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const data = result.map((item) => ({
      status: item._id,
      totalRevenue: item.totalRevenue,
    }));

    return res.status(200).json({
      success: true,
      message: "Revenue by status fetched successfully!",
      data,
    });
  } catch (error) {
    console.error("Error in getRevenueByStatus:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching revenue by status",
      error: error.message,
    });
  }
};

// Get Revenue By Date
export const RevenueByDate = async (req, res) => {
  try {
    const days = Number(req.query.days) || 7;

    // From date = today - (days - 1)
    const fromDate = new Date();
    fromDate.setHours(0, 0, 0, 0);
    fromDate.setDate(fromDate.getDate() - (days - 1));

    const result = await Order.aggregate([
      {
        $match: {
          isDel: false,
          status: { $ne: "CANCELLED" }, // don't count cancelled in revenue
          order_date: { $gte: fromDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$order_date" },
          },
          totalRevenue: { $sum: "$grand_total" },
          orderCount: { $sum: 1 }, // also get count of orders for chart
        },
      },
      {
        $sort: { _id: 1 }, // sort by date ascending
      },
    ]);

    const data = result.map((item) => ({
      date: item._id,
      totalRevenue: item.totalRevenue,
      orderCount: item.orderCount,
    }));

    return res.status(200).json({
      success: true,
      message: "Revenue by date fetched successfully!",
      data,
    });
  } catch (error) {
    console.error("Error in fetched revenue by date:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching revenue by date",
      error: error.message,
    });
  }
};

// Get Orders By Date
export const OrdersByDate = async (req, res) => {
  try {
    const days = Number(req.query.days) || 7;

    // From date = today - (days - 1)
    const fromDate = new Date();
    fromDate.setHours(0, 0, 0, 0); // start from midnight
    fromDate.setDate(fromDate.getDate() - (days - 1));

    const result = await Order.aggregate([
      {
        $match: {
          isDel: false,              // ignore soft-deleted orders
          order_date: { $gte: fromDate }, // only last N days
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$order_date" },
          },
          orderCount: { $sum: 1 },   // count orders for that date
        },
      },
      {
        $sort: { _id: 1 },           // sort by date ascending
      },
    ]);

    const data = result.map((item) => ({
      date: item._id,
      orderCount: item.orderCount,
    }));

    return res.status(200).json({
      success: true,
      message: "Orders by date fetched successfully!",
      data,
    });
  } catch (error) {
    console.error("Error in fetched revenue by date:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching revenue by date",
      error: error.message,
    });
  }
};

// Get Customers Growth
export const CustomersGrowth = async (req, res) => {
  try {// year from query ?year=2025, else current year
    const year = Number(req.query.year) || new Date().getFullYear();

    // Start = 1 Jan of that year, End = 1 Jan of next year
    const startDate = new Date(year, 0, 1);      // Jan 1, 00:00:00
    const endDate = new Date(year + 1, 0, 1);    // Jan 1 next year

    const aggResult = await User.aggregate([
      {
        $match: {
          // if you have soft delete flag, add isDel: false here
          role: 1,
          is_del: false,
          user_type: "customer",
          createdAt: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } }, // 1..12
          customerCount: { $sum: 1 },               // how many joined that month
        },
      },
      {
        $sort: { "_id.month": 1 }, // Jan → Dec
      },
    ]);

    // Prepare 12 months with 0 by default
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];

    const countsByMonth = new Map();
    aggResult.forEach((item) => {
      countsByMonth.set(item._id.month, item.customerCount);
    });

    // total customers in that year → for percentage in legend
    const totalInYear = aggResult.reduce(
      (sum, item) => sum + item.customerCount,
      0
    );

    const data = monthNames.map((name, index) => {
      const monthNumber = index + 1; // 1..12
      const customerCount = countsByMonth.get(monthNumber) || 0;
      const percentage =
        totalInYear === 0
          ? 0
          : Math.round((customerCount / totalInYear) * 100); // e.g. 75%

      return {
        monthNumber,                       // 1..12
        monthName: `${name} ${year}`,      // "January 2025"
        customerCount,                     // how many joined
        percentage,                        // share of that year
      };
    });

    return res.status(200).json({
      success: true,
      message: `Customer growth by month for ${year} fetched successfully!`,
      data,
    });
  } catch (error) {
    console.error("Error in fetched Customers by month:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching Customers by month",
      error: error.message,
    });
  }
};

// Get Delivery Partners Growth
export const DeliveryPartnersGrowth = async (req, res) => {
  try {// year from query ?year=2025, else current year
    const year = Number(req.query.year) || new Date().getFullYear();

    // Start = 1 Jan of that year, End = 1 Jan of next year
    const startDate = new Date(year, 0, 1);      // Jan 1, 00:00:00
    const endDate = new Date(year + 1, 0, 1);    // Jan 1 next year

    const aggResult = await User.aggregate([
      {
        $match: {
          // if you have soft delete flag, add isDel: false here
          role: 2,
          is_del: false,
          user_type: "delivery_boy",
          createdAt: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } }, // 1..12
          customerCount: { $sum: 1 },               // how many joined that month
        },
      },
      {
        $sort: { "_id.month": 1 }, // Jan → Dec
      },
    ]);

    // Prepare 12 months with 0 by default
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];

    const countsByMonth = new Map();
    aggResult.forEach((item) => {
      countsByMonth.set(item._id.month, item.customerCount);
    });

    // total customers in that year → for percentage in legend
    const totalInYear = aggResult.reduce(
      (sum, item) => sum + item.customerCount,
      0
    );

    const data = monthNames.map((name, index) => {
      const monthNumber = index + 1; // 1..12
      const customerCount = countsByMonth.get(monthNumber) || 0;
      const percentage =
        totalInYear === 0
          ? 0
          : Math.round((customerCount / totalInYear) * 100); // e.g. 75%

      return {
        monthNumber,                       // 1..12
        monthName: `${name} ${year}`,      // "January 2025"
        customerCount,                     // how many joined
        percentage,                        // share of that year
      };
    });

    return res.status(200).json({
      success: true,
      message: `Delivery Partners growth by month for ${year} fetched successfully!`,
      data,
    });
  } catch (error) {
    console.error("Error in fetched Delivery Partners by month:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching Delivery Partners by month",
      error: error.message,
    });
  }
};

export const getDailyOrderSummaryByDate_OLD = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    /* =========================
       NORMALIZE DATE
    ========================= */
    const selectedDate = new Date(date);
    selectedDate.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    /* =========================
       LOAD ADDITIONAL ITEM NAMES
    ========================= */
    const additionalItems = await additionalItemModel.find({}, { itemName: 1 });

    console.log("Here I am getting additional items: ", additionalItems);

    const additionalItemNameMap = {};
    additionalItems.forEach(item => {
      additionalItemNameMap[item._id.toString()] = item.itemName;
    });

    /* =========================
       FIND ACTIVE PAID ORDERS
    ========================= */
    const orders = await allOrdersData.find({
      payment_status: "paid",
      items: {
        $elemMatch: {
          start_date: { $lte: endOfDay },
          end_date: { $gte: selectedDate },
        },
      },
    });

    let vegCount = 0;
    let nonVegCount = 0;
    let additionalItemsTotal = 0;
    let additionalItemsMap = {};

    /* =========================
       PROCESS ORDERS
    ========================= */
    orders.forEach(order => {
      order.items.forEach(item => {

        /* SUBSCRIPTIONS */
        if (
          item.item_type === "subscription" &&
          selectedDate >= new Date(item.start_date) &&
          selectedDate <= new Date(item.end_date)
        ) {
          if (item.subscription_type === "veg") vegCount++;
          if (item.subscription_type === "non_veg") nonVegCount++;
        }

        /* ADDITIONAL ITEMS */
        if (item.item_type === "additional_item") {
          item.additional_items.forEach(addon => {
            if (
              selectedDate >= new Date(addon.addon_start_date) &&
              selectedDate <= new Date(addon.addon_end_date)
            ) {
              const itemName =
                additionalItemNameMap[addon.item_id.toString()] || "Unknown Item";

              const quantity = addon.quantity || 1;

              additionalItemsTotal += quantity;

              if (!additionalItemsMap[itemName]) {
                additionalItemsMap[itemName] = 0;
              }

              additionalItemsMap[itemName] += quantity;
            }
          });
        }
      });
    });

    /* =========================
       RESPONSE
    ========================= */
    return res.status(200).json({
      success: true,
      date: selectedDate,
      vegSubscriptions: vegCount,
      nonVegSubscriptions: nonVegCount,
      additionalItemsCount: additionalItemsTotal,
      additionalItemsBreakdown: additionalItemsMap,
    });

  } catch (error) {
    console.error("Daily order summary error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch daily order summary",
    });
  }
};


export const getDailyOrderSummaryByDate = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    /* =========================
       NORMALIZE DATE
    ========================= */
    const selectedDate = new Date(date);
    selectedDate.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);



    /* =========================
    3. FETCH WEEKLY MENU
    ========================= */
    const weeklyMenu = await WeeklyMenu.findOne({ date: selectedDate })
      .populate("vegLunch vegDinner nonVegLunch nonVegDinner");

    if (!weeklyMenu) {
      return res.status(200).json({
        success: true,
        hasOrder: true,
        message: "Menu not published for this date",
        data: null,
      });
    }

    //console.log(weeklyMenu)


    /* =========================
    5. FORMAT SUBSCRIPTION MENUS
    ========================= */
    const menus = {
      veg: {
        lunch: weeklyMenu.vegLunch || null,
        dinner: weeklyMenu.vegDinner || null,
      },
      nonVeg: {
        lunch: weeklyMenu.nonVegLunch || null,
        dinner: weeklyMenu.nonVegDinner || null,
      },
    };

    /* =========================
       LOAD ADDITIONAL ITEM DETAILS
    ========================= */
    const additionalItems = await additionalItemModel.find(
      {},
      { itemName: 1, images: 1 } // add image
    );

    const additionalItemMap = {};
    additionalItems.forEach(item => {
      additionalItemMap[item._id.toString()] = {
        name: item.itemName,
        image: item.images?.[0] || null, // ✅ FIX HERE
      };
    });

    /* =========================
       FIND ACTIVE PAID ORDERS
    ========================= */
    const orders = await allOrdersData.find({
      payment_status: "paid",
      items: {
        $elemMatch: {
          start_date: { $lte: endOfDay },
          end_date: { $gte: selectedDate },
        },
      },
    });

    let vegCount = 0;
    let nonVegCount = 0;
    let additionalItemsTotal = 0;
    let additionalItemsMap = {};

    /* =========================
       PROCESS ORDERS
    ========================= */
    orders.forEach(order => {
      (order.items || []).forEach(item => {

        /* SUBSCRIPTIONS */
        if (
          item.item_type === "subscription" &&
          selectedDate >= new Date(item.start_date) &&
          selectedDate <= new Date(item.end_date)
        ) {
          if (item.subscription_type === "veg") vegCount++;
          if (item.subscription_type === "non_veg") nonVegCount++;
        }

        /* ADDITIONAL ITEMS */
        if (item.item_type === "additional_item") {
          (item.additional_items || []).forEach(addon => {

            if (
              selectedDate >= new Date(addon.addon_start_date) &&
              selectedDate <= new Date(addon.addon_end_date)
            ) {
              const itemId = addon.item_id.toString();
              const quantity = addon.quantity || 1;

              additionalItemsTotal += quantity;

              if (!additionalItemsMap[itemId]) {
                const itemData = additionalItemMap[itemId] || {};

                additionalItemsMap[itemId] = {
                  itemId,
                  name: itemData.name || "Unknown Item",
                  image: itemData.image || null, // now works
                  totalQuantity: 0,
                };
              }

              additionalItemsMap[itemId].totalQuantity += quantity;
            }
          });
        }
      });
    });

    /* =========================
       RESPONSE
    ========================= */
    return res.status(200).json({
      success: true,
      date: selectedDate,
      menus,
      vegSubscriptions: vegCount,
      nonVegSubscriptions: nonVegCount,
      additionalItemsCount: additionalItemsTotal,
      additionalItemsBreakdown: additionalItemsMap,
    });

  } catch (error) {
    console.error("Daily order summary error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch daily order summary",
    });
  }
};

export const getDailyOrderSummaryGroupedByZipCode123 = async (req, res) => {
  try {
    console.log("Zip Code API is running successfully! ");
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    /* =========================
       NORMALIZE DATE
    ========================= */
    const selectedDate = new Date(date);
    selectedDate.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    /* =========================
       LOAD ADDITIONAL ITEM NAMES
    ========================= */
    const additionalItems = await additionalItemModel.find({}, { itemName: 1 });

    const additionalItemNameMap = {};
    additionalItems.forEach(item => {
      additionalItemNameMap[item._id.toString()] = item.itemName;
    });

    /* =========================
       FETCH ALL PAID ORDERS
    ========================= */
    const orders = await allOrdersData.find({
      payment_status: "paid",
      items: {
        $elemMatch: {
          start_date: { $lte: endOfDay },
          end_date: { $gte: selectedDate },
        },
      },
    });

    /**
     * zipCodeSummary = {
     *   "560001": {
     *      veg: 0,
     *      nonVeg: 0,
     *      additionalItemsTotal: 0,
     *      additionalItemsBreakdown: {}
     *   }
     * }
     */
    const zipCodeSummary = {};

    /* =========================
       PROCESS ORDERS
    ========================= */
    orders.forEach(order => {
      const zipCode = order.shipping_address?.zipCode || "UNKNOWN";

      if (!zipCodeSummary[zipCode]) {
        zipCodeSummary[zipCode] = {
          vegSubscriptions: 0,
          nonVegSubscriptions: 0,
          additionalItemsCount: 0,
          additionalItemsBreakdown: {},
        };
      }

      order.items.forEach(item => {

        /* SUBSCRIPTIONS */
        if (
          item.item_type === "subscription" &&
          selectedDate >= new Date(item.start_date) &&
          selectedDate <= new Date(item.end_date)
        ) {
          if (item.subscription_type === "veg") {
            zipCodeSummary[zipCode].vegSubscriptions++;
          }

          if (item.subscription_type === "non_veg") {
            zipCodeSummary[zipCode].nonVegSubscriptions++;
          }
        }

        /* ADDITIONAL ITEMS */
        if (item.item_type === "additional_item") {
          item.additional_items.forEach(addon => {
            if (
              selectedDate >= new Date(addon.addon_start_date) &&
              selectedDate <= new Date(addon.addon_end_date)
            ) {
              const itemName =
                additionalItemNameMap[addon.item_id.toString()] || "Unknown Item";

              const quantity = addon.quantity || 1;

              zipCodeSummary[zipCode].additionalItemsCount += quantity;

              if (!zipCodeSummary[zipCode].additionalItemsBreakdown[itemName]) {
                zipCodeSummary[zipCode].additionalItemsBreakdown[itemName] = 0;
              }

              zipCodeSummary[zipCode].additionalItemsBreakdown[itemName] += quantity;
            }
          });
        }
      });
    });

    /* =========================
       FETCH WEEKLY MENU
    ========================= */
    const menuDate = new Date(date);
    menuDate.setHours(0, 0, 0, 0);

    const weeklyMenu = await WeeklyMenu.findOne({ date: menuDate })
      .populate("vegLunch vegDinner nonVegLunch nonVegDinner");

    console.log("Here is my weekly menu in zipcode: ", weeklyMenu);

    /* =========================
       RESPONSE
    ========================= */
    return res.status(200).json({
      success: true,
      date: selectedDate,
      summaryByZipCode: zipCodeSummary,
      weeklyMenu: weeklyMenu || null,
    });

  } catch (error) {
    console.error("Daily order summary grouped by zipCode error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch daily order summary",
    });
  }
};

export const getDailyOrderSummaryGroupedByZipCode = async (req, res) => {
  try {
    // console.log("Zip Code API is running successfully!");

    const { date } = req.query;

    // console.log("Here I am getting date: ", date);

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    /* =========================
       NORMALIZE DATE (UTC SAFE)
    ========================= */
    const selectedDate = new Date(date);
    selectedDate.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    /* =========================
       LOAD ADDITIONAL ITEM NAMES
    ========================= */
    const additionalItems = await additionalItemModel.find({}, { itemName: 1 });

    const additionalItemNameMap = {};
    additionalItems.forEach(item => {
      additionalItemNameMap[item._id.toString()] = item.itemName;
    });

    /* =========================
       FETCH ALL PAID ORDERS
    ========================= */
    const orders = await allOrdersData.find({
      payment_status: "paid",
      items: {
        $elemMatch: {
          start_date: { $lte: endOfDay },
          end_date: { $gte: selectedDate },
        },
      },
    });

    console.log("Here I am getting my all order data: ", orders);

    /* =========================
       GROUP BY ZIP CODE
    ========================= */
    const zipCodeSummary = {};

    orders.forEach(order => {
      const zipCode = order.shipping_address?.zipCode || "UNKNOWN";

      if (!zipCodeSummary[zipCode]) {
        zipCodeSummary[zipCode] = {
          vegSubscriptions: 0,
          nonVegSubscriptions: 0,
          additionalItemsCount: 0,
          additionalItemsBreakdown: {},
        };
      }

      order.items.forEach(item => {

        /* -------- SUBSCRIPTIONS -------- */
        if (
          item.item_type === "subscription" &&
          selectedDate >= new Date(item.start_date) &&
          selectedDate <= new Date(item.end_date)
        ) {
          if (item.subscription_type === "veg") {
            zipCodeSummary[zipCode].vegSubscriptions++;
          }

          if (item.subscription_type === "non_veg") {
            zipCodeSummary[zipCode].nonVegSubscriptions++;
          }
        }

        /* -------- ADDITIONAL ITEMS -------- */
        if (item.item_type === "additional_item") {
          item.additional_items.forEach(addon => {
            if (
              Array.isArray(addon.delivery_dates) &&
              addon.delivery_dates.some(d => {
                const deliveryDate = new Date(d);
                deliveryDate.setUTCHours(0, 0, 0, 0);
                return deliveryDate.getTime() === selectedDate.getTime();
              })
            ) {
              const itemName =
                additionalItemNameMap[addon.item_id.toString()] || "Unknown Item";

              const quantity = addon.quantity || 1;

              zipCodeSummary[zipCode].additionalItemsCount += quantity;

              if (!zipCodeSummary[zipCode].additionalItemsBreakdown[itemName]) {
                zipCodeSummary[zipCode].additionalItemsBreakdown[itemName] = 0;
              }

              zipCodeSummary[zipCode].additionalItemsBreakdown[itemName] += quantity;
            }
          });
        }
      });
    });

    /* =========================
       FETCH WEEKLY MENU (IDENTICAL LOGIC)
    ========================= */
    const weeklyMenu = await WeeklyMenu.findOne({ date: selectedDate })
      .populate("vegLunch vegDinner nonVegLunch nonVegDinner");

    if (!weeklyMenu) {
      return res.status(200).json({
        success: true,
        hasOrder: true,
        message: "Menu not published for this date",
        data: null,
      });
    }

    const menus = {
      veg: {
        lunch: weeklyMenu.vegLunch || null,
        dinner: weeklyMenu.vegDinner || null,
      },
      nonVeg: {
        lunch: weeklyMenu.nonVegLunch || null,
        dinner: weeklyMenu.nonVegDinner || null,
      },
    };


    /* =========================
       FINAL RESPONSE
    ========================= */
    return res.status(200).json({
      success: true,
      date: selectedDate,
      menus,
      summaryByZipCode: zipCodeSummary,
      // weeklyMenu: weeklyMenu || null,
    });

  } catch (error) {
    console.error("Daily order summary grouped by zipCode error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch daily order summary",
    });
  }
};