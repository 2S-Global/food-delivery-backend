import additionalItemModel from "../models/additionalItemModel.js";
import SubscriptionPrice from "../models/subscriptionPriceModel.js";
import UserCart from "../models/userCartModel.js"

// Add to cart API
export const userAddToCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { subscription_type, weeks, additional_items } = req.body;

    // Validate input
    if (!subscription_type || !weeks) {
      return res.status(400).json({
        success: false,
        message: "subscription_type and weeks are required",
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

    // MAIN CART LOGIC

    // Check whether cart already exists
    let cart = await UserCart.findOne({ user_id: userId });

    if (!cart) {
      // Create new cart with first item
      cart = new UserCart({
        user_id: userId,
        items: [
          {
            subscription_type,
            weeks,
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

    // Calculate totals per item & full cart total
    let finalCartItems = [];
    let grandTotal = 0;

    for (const item of cart.items) {
      let itemTotal = item.total_price;

      finalCartItems.push({
        _id: item._id,
        subscription_type: item.subscription_type,
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