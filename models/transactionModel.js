import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    payment_method: {
      type: String,
      enum: ["online", "wallet", "free"],
      required: true,
    },

    payment_status: {
      type: String,
      enum: ["success", "failed", "pending"],
      default: "success",
    },

    razorpay_payment_id: {
      type: String,
      default: null,
    },

    razorpay_order_id: {
      type: String,
      default: null,
    },

    razorpay_signature: {
      type: String,
      default: null,
    },

    transaction_type: {
      type: String,
      enum: ["debit", "credit"],
      default: "debit",
    },

    transaction_id: {
      type: String,
      unique: true,
      required: true,
    },

    notes: {
      type: String,
    },

    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", TransactionSchema);

export default Transaction;