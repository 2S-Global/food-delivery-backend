import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  razorpay_order_id: String,
  amount: Number,
  status: { type: String, default: 'pending' },
});

const PaymentOrder = mongoose.model('payment_order',  orderSchema);

export default PaymentOrder;