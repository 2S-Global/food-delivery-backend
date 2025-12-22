import Razorpay from 'razorpay';
import PaymentOrder from "../models/PaymentOrderModel.js";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Controller to create a Razorpay order
export const createOrder = async (req, res) => {
    const { amount } = req.body;

    // Basic validation
    if (!amount || isNaN(amount) || amount < 1) {
        return res.status(400).json({ error: 'Invalid or missing amount' });
    }

    try {
        const amountInPaise = Math.round(parseFloat(amount) * 100);
        const order = await razorpay.orders.create({
            amount: amountInPaise,
            currency: 'INR',
            payment_capture: 1,
        });

        // Save order in DB
        const newOrder = new PaymentOrder({
            razorpay_order_id: order.id,
            amount,
        });

        await newOrder.save();

        // Send success response
        res.status(201).json({ order });
    } catch (err) {
        console.error('Error creating Razorpay order:', err);

        // Detailed error logging
        const errorMessage =
            err?.error?.description || err?.message || 'Something went wrong';

        res.status(500).json({
            error: 'Unable to create Razorpay order',
            details: errorMessage,
        });
    }
};