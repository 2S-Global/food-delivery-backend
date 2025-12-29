// import crypto from "crypto";
// import UserCart from "../models/UserCart.js";
// import Order from "../models/Order.js";
// import Transaction from "../models/Transaction.js";

import UserCart from "../models/userCartModel.js";
import AllOrdersData from "../models/allOrders.js";
import Transaction from "../models/transactionModel.js";

export const paynow123Chandra = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID missing" });
    }

    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      payment_method,   // "online" or "wallet"
      amount,
      address,
      cardCVV,
      cardExpiry,
      cardName,
      cardNumber,
      city,
      email,
      firstName,
      lastName,
      phone,
      state,
      zipCode
    } = req.body;

    if (!amount) {
      return res.status(400).json({ success: false, message: "Payment details missing" });
    }

    const maskedCard = cardNumber
      ? cardNumber.slice(0, 4) + "XXXXXXXX" + cardNumber.slice(-4)
      : null;

    // Validate cart
    const cart = await UserCart.findOne({ user_id: userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    console.log("here is my card details: ", cart);

    // Razorpay verification only when online payment

    // for payment method Online started
    /*
    if (payment_method === "online") {

      if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: "Missing Razorpay payment verification fields"
        });
      }

      const sign = razorpay_order_id + "|" + razorpay_payment_id;

      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(sign.toString())
        .digest("hex");

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: "Payment Verification Failed"
        });
      }
    }
    */
    // for payment method Online ended

    // ORDER CREATION AFTER SUCCESS
    const order = new AllOrdersData({
      user_id: userId,
      items: cart.items,
      total_price: amount,
      payment_method,
      payment_status: "paid",
      payment_id: razorpay_payment_id || null,
      order_number: `ORD-${Date.now()}`,

      shipping_address: {
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        state,
        zipCode
      },

      cardDetails: {
        cardName,
        cardNumberMasked: maskedCard,  // stored safely
        cardExpiry
      },

      createdAt: new Date()
    });

    const savedOrder = await order.save();

    // TRANSACTION HISTORY ENTRY
    const transaction = new Transaction({
      user_id: userId,
      order_id: savedOrder._id,
      amount: amount,
      payment_method: payment_method,
      payment_status: "success",                     // payment succeeded
      razorpay_payment_id: razorpay_payment_id || null,
      razorpay_order_id: razorpay_order_id || null,
      razorpay_signature: razorpay_signature || null,
      transaction_type: "debit",                     // customer paying
      transaction_id: `TXN-${Date.now()}`,           // unique transaction ref
      is_deleted: false
    });

    await transaction.save();

    // CLEAR USER CART
    await UserCart.deleteOne({ user_id: userId });

    return res.status(200).json({
      success: true,
      message: "Payment completed and order created successfully",
      order: savedOrder
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to process payment",
      error: error.message
    });
  }
};

