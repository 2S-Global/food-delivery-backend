import additionalItemModel from "../models/additionalItemModel.js";
import SubscriptionPrice from "../models/subscriptionPriceModel.js";
import UserCart from "../models/userCartModel.js"
import { calculateAddonDeliveries } from "./Helpers/calculateAddonDeliveries.js"

import Razorpay from "razorpay";
import crypto from "crypto";

// Configure Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Add to cart API
export const userAddToCart123 = async (req, res) => {
  try {
    const userId = req.userId;
    const { subscription_type, start_date, end_date, additional_items } = req.body;

    console.log("Here is my request body: ", req.body);

    // Validate input
    if (!subscription_type || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: "subscription_type, start_date and end_date are required",
      });
    }

    // Parse dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (isNaN(startDate) || isNaN(endDate)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    // Calculate week difference
    const diffInMs = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24)); // convert ms to days
    const weeks = Math.ceil(diffDays / 7); // convert days to weeks

    if (endDate <= startDate) {
      return res.status(400).json({
        success: false,
        message: "end_date must be greater than start_date",
      });
    }

    // 1. Fetch price from DB
    const priceDoc = await SubscriptionPrice.findOne();
    // console.log("Here is my all Price: ", priceDoc);

    if (!priceDoc) {
      return res.status(404).json({
        success: false,
        message: "Subscription price not found"
      });
    }

    // 2. decide price based on subscription type
    let perWeekPrice;

    if (subscription_type === "veg") {
      perWeekPrice = priceDoc.vegPrice;
    } else if (subscription_type === "non_veg") {
      perWeekPrice = priceDoc.nonVegPrice;
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription type"
      });
    }

    // Base cost (week price * number of weeks)
    let totalPrice = perWeekPrice * weeks;

    // Meal count => 2 meals per day * 7 days per week
    let mealCount = weeks * 13;

    // Add-ons handling
    let addonItems = [];

    /*
    if (additional_items && Array.isArray(additional_items)) {
      for (const item of additional_items) {
        const addon = await additionalItemModel.findById(item.item_id);

        if (addon) {
          totalPrice += addon.itemPrice * (item.quantity || 1);
          // addonItems.push(item);
          addonItems.push({
            item_id: item.item_id,
            quantity: item.quantity || 1,
          });
        }
      }
    }
    */

    if (additional_items && Array.isArray(additional_items)) {
      for (const item of additional_items) {

        if (
          !item.item_id ||
          !item.addon_schedule_type ||
          !item.addon_start_date
        ) {
          return res.status(400).json({
            success: false,
            message:
              "item_id, addon_start_date and addon_schedule_type are required for additional items",
          });
        }

        const addonStartDate = new Date(item.addon_start_date);

        if (isNaN(addonStartDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid addon_start_date format",
          });
        }

        const addon = await additionalItemModel.findById(item.item_id);
        if (!addon) {
          return res.status(404).json({
            success: false,
            message: `Additional item not found: ${item.item_id}`,
          });
        }

        const deliveryCount = calculateAddonDeliveries(
          addonStartDate,
          endDate,
          item.addon_schedule_type
        );

        console.log("Calculated deliveryCount: ", deliveryCount);

        const quantity = item.quantity || 1;

        const addonTotalPrice =
          addon.itemPrice * quantity * deliveryCount;

        totalPrice += addonTotalPrice;

        addonItems.push({
          item_id: item.item_id,
          quantity,
          addon_schedule_type: item.addon_schedule_type,
          addon_start_date: addonStartDate,
          delivery_count: deliveryCount,
          item_price: addon.itemPrice,
          total_price: addonTotalPrice,
        });
      }
    }


    // MAIN CART LOGIC

    // Check whether cart already exists
    let cart = await UserCart.findOne({ user_id: userId });

    console.log("Dang Dang till here it is running: ", cart);

    if (!cart) {
      // Create new cart with first item
      cart = new UserCart({
        user_id: userId,
        items: [
          {
            subscription_type,
            weeks,
            start_date: startDate,
            end_date: endDate,
            meal_count: mealCount,
            additional_items: addonItems,
            total_price: totalPrice,
          },
        ],
      });
    } else {
      // Push new item to existing cart
      cart.items.push({
        subscription_type,
        weeks,
        start_date: startDate,
        end_date: endDate,
        meal_count: mealCount,
        additional_items: addonItems,
        total_price: totalPrice,
      });
    }

    const updatedCart = await cart.save();



    return res.status(200).json({
      success: true,
      message: "Item added to cart successfully",
      data: updatedCart,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error adding items to cart",
      error: error.message,
    });
  }
};

export const userAddToCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { item_type } = req.body;

    if (!item_type) {
      return res.status(400).json({
        success: false,
        message: "item_type is required",
      });
    }

    let cart = await UserCart.findOne({ user_id: userId });
    if (!cart) {
      cart = new UserCart({ user_id: userId, items: [] });
    }

    /* ======================================================
       CASE 1: ADD / UPDATE SUBSCRIPTION
    ====================================================== */
    if (item_type === "subscription") {
      const { subscription_type, start_date, end_date } = req.body;

      if (!subscription_type || !start_date || !end_date) {
        return res.status(400).json({
          success: false,
          message: "subscription_type, start_date, end_date are required",
        });
      }

      if (!["veg", "non_veg"].includes(subscription_type)) {
        return res.status(400).json({
          success: false,
          message: "Invalid subscription_type",
        });
      }

      const startDate = new Date(start_date);
      const endDate = new Date(end_date);

      if (isNaN(startDate) || isNaN(endDate) || endDate <= startDate) {
        return res.status(400).json({
          success: false,
          message: "Invalid start_date or end_date",
        });
      }

      const diffDays = Math.ceil(
        (endDate - startDate) / (1000 * 60 * 60 * 24)
      );
      const weeks = Math.ceil(diffDays / 7);
      const mealCount = weeks * 13;

      const priceDoc = await SubscriptionPrice.findOne();
      if (!priceDoc) {
        return res.status(404).json({
          success: false,
          message: "Subscription price not found",
        });
      }

      const perWeekPrice =
        subscription_type === "veg"
          ? priceDoc.vegPrice
          : priceDoc.nonVegPrice;

      const totalPrice = perWeekPrice * weeks;

      // Remove existing subscription
      // cart.items = cart.items.filter(
      //   (i) => i.item_type !== "subscription"
      // );

      cart.items.push({
        item_type: "subscription",
        subscription_type,
        start_date: startDate,
        end_date: endDate,
        weeks,
        meal_count: mealCount,
        total_price: totalPrice,
      });
    }

    /* ======================================================
       CASE 2: ADD / UPDATE ADDITIONAL ITEMS
    ====================================================== */
    if (item_type === "additional_item") {
      const { additional_items } = req.body;

      if (!Array.isArray(additional_items) || additional_items.length === 0) {
        return res.status(400).json({
          success: false,
          message: "additional_items is required",
        });
      }

      // Subscription must exist
      const subscription = cart.items.find(
        (i) => i.item_type === "subscription"
      );

      if (!subscription) {
        return res.status(400).json({
          success: false,
          message:
            "Please add a subscription before adding additional items",
        });
      }

      let totalAddonPrice = 0;
      const addonItems = [];

      for (const item of additional_items) {
        const {
          item_id,
          quantity = 1,
          addon_start_date,
          addon_schedule_type,
        } = item;

        if (!item_id || !addon_start_date || !addon_schedule_type) {
          return res.status(400).json({
            success: false,
            message:
              "item_id, addon_start_date and addon_schedule_type are required",
          });
        }

        const addonStartDate = new Date(addon_start_date);
        if (isNaN(addonStartDate)) {
          return res.status(400).json({
            success: false,
            message: "Invalid addon_start_date",
          });
        }

        const addon = await additionalItemModel.findById(item_id);
        if (!addon) {
          return res.status(404).json({
            success: false,
            message: `Additional item not found: ${item_id}`,
          });
        }

        const deliveryCount = calculateAddonDeliveries(
          addonStartDate,
          subscription.end_date,
          addon_schedule_type
        );

        const itemTotal =
          addon.itemPrice * quantity * deliveryCount;

        totalAddonPrice += itemTotal;

        addonItems.push({
          item_id,
          quantity,
          addon_start_date: addonStartDate,
          addon_schedule_type,
        });
      }

      // Remove existing add-ons
      // cart.items = cart.items.filter(
      //   (i) => i.item_type !== "additional_item"
      // );

      cart.items.push({
        item_type: "additional_item",
        additional_items: addonItems,
        total_price: totalAddonPrice,
      });
    }

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      data: cart,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Error adding to cart",
      error: error.message,
    });
  }
};




export const getUserCart = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Login required",
      });
    }

    const cart = await UserCart.findOne({ user_id: userId }).populate({
      path: "items.additional_items.item_id",
      select: "itemName itemPrice",
    });

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Cart is empty",
        data: [],
      });
    }

    console.log("Here is my user cart: ", cart);

    // Calculate totals per item & full cart total
    let finalCartItems = [];
    let grandTotal = 0;

    for (const item of cart.items) {
      let itemTotal = item.total_price;

      finalCartItems.push({
        _id: item._id,
        item_type: item.item_type,
        subscription_type: item.subscription_type,
        start_date: item.start_date,
        end_date: item.end_date,
        weeks: item.weeks,
        meal_count: item.meal_count,
        additional_items: item.additional_items,
        item_total_price: itemTotal,
      });

      grandTotal += itemTotal;
    }

    return res.status(200).json({
      success: true,
      message: "Cart fetched successfully",
      data: {
        user_id: cart.user_id,
        items: finalCartItems,
        total_cart_amount: grandTotal,
      },
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching cart",
      error: error.message,
    });
  }
};

export const deleteUserCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { cartItemId } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Login required",
      });
    }

    if (!cartItemId) {
      return res.status(400).json({
        success: false,
        message: "cartItemId is required",
      });
    }

    // Check user cart exists
    let cart = await UserCart.findOne({ user_id: userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Find item index in items[]
    const index = cart.items.findIndex(
      (item) => item._id.toString() === cartItemId
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    // Remove item
    cart.items.splice(index, 1);

    // Save updated cart
    const updatedCart = await cart.save();

    return res.status(200).json({
      success: true,
      message: "Cart item deleted successfully",
      data: updatedCart,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting cart item",
      error: error.message,
    });
  }
};

export const checkoutPay = async (req, res) => {
  try {
    const userId = req.userId;

    // 1. Get user cart
    const cart = await UserCart.findOne({ user_id: userId });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // 2. Calculate payable amount
    let totalPayable = 0;

    for (const item of cart.items) {
      totalPayable += item.total_price;
    }

    // Razorpay expects amount in paise, multiply by 100
    const payment_amount = totalPayable * 100;

    console.log("Here is the total payment_amount: ", payment_amount);

    console.log("KEY ID:", process.env.RAZORPAY_KEY_ID);
    console.log("KEY SECRET:", process.env.RAZORPAY_KEY_SECRET);

    // 3. Create order in Razorpay
    const order = await razorpay.orders.create({
      amount: payment_amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });


    console.log("Here is the total payment_amount: ", payment_amount);

    // 4. Store payment intent/order in database
    // optional if you want to link order to user cart

    return res.status(200).json({
      success: true,
      message: "Payment order created successfully",
      order_id: order.id,
      amount: payment_amount,
      currency: "INR",
      cart: cart,
    });

  } catch (error) {
    // return res.status(500).json({
    //   success: false,
    //   message: "Checkout failed",
    //   error: error.message,
    // });


    console.log("Razorpay full error ===>");
    console.log(error);               // prints full object

    return res.status(500).json({
      success: false,
      message: "Checkout failed",
      error: error
    });


  }
};