import Order from "../models/orderModel.js";
import OrderDetail from "../models/orderDetailsModel.js";

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
                total_amount: lineTotal
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