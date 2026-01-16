import UserCart from "../models/userCartModel.js";
import AllOrdersData from "../models/allOrders.js";
import Transaction from "../models/transactionModel.js";
import nodemailer from "nodemailer";
import Menus from "../models/menuModel.js";
import AdditionalItems from "../models/additionalItemModel.js";

export const sendOrderConfirmationMail = async ({ to, order }) => {

  const transporterEmailVerification = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const itemsHtml = (
    await Promise.all(
      order.items.map(async (item) => {

        /* ===================== SUBSCRIPTION ===================== */
        if (item.item_type === "subscription") {

          const menu = await Menus.findOne({
            menuType: item.subscription_type === "veg" ? "Veg" : "Non-Veg"
          }).select("name images");

          const image = menu?.images?.[0] || "";
          const name =
            menu?.name || `${item.subscription_type.toUpperCase()} Subscription`;

          return `
          <tr>
            <td align="center" valign="middle">
              <img src="${image}" width="70" height="70" style="object-fit:cover;" />
            </td>
            <td align="center" valign="middle">
              <strong>${name}</strong>
            </td>
            <td align="center" valign="middle">
              ${item.meal_count} Meals
            </td>
            <td align="center" valign="middle">
              ${item.weeks} Week(s)<br/>
              ${new Date(item.start_date).toDateString()} –
              ${new Date(item.end_date).toDateString()}
            </td>
            <td align="center" valign="middle">
              £${item.total_price}
            </td>
          </tr>
        `;
        }

        /* ===================== ADDITIONAL ITEMS ===================== */
        if (item.item_type === "additional_item") {

          const addonRows = await Promise.all(
            item.additional_items.map(async (addon) => {

              const addonData = await AdditionalItems
                .findById(addon.item_id)
                .select("itemName images");

              const image = addonData?.images?.[0] || "";
              const name = addonData?.itemName || "Additional Item";

              return `
              <tr>
                <td align="center" valign="middle">
                  <img src="${image}" width="70" height="70" style="object-fit:cover;" />
                </td>
                <td align="center" valign="middle">
                  <strong>${name}</strong>
                </td>
                <td align="center" valign="middle">
                  ${addon.quantity}
                </td>
                <td align="center" valign="middle">
                  ${addon.delivery_count} Deliveries<br/>
                  ${new Date(addon.addon_start_date).toDateString()} –
                  ${new Date(addon.addon_end_date).toDateString()}
                </td>
                <td align="center" valign="middle">
                  £${item.total_price}
                </td>
              </tr>
            `;
            })
          );

          return addonRows.join("");
        }

        return "";
      })
    )
  ).join("");




  const mailOptions = {
    from: `"Food App" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Order Confirmation - ${order.order_number}`,
    html: `
      <h2>Thank you for your order!</h2>
      <p>Your payment was successful. Below are your order details:</p>

      <p><strong>Order Number:</strong> ${order.order_number}</p>
      <p><strong>Payment Method:</strong> ${order.payment_method}</p>
      <p><strong>Total Amount:</strong> £${order.total_price}</p>

      <h3>Ordered Items</h3>
      <table border="1" cellpadding="8" cellspacing="0" width="100%">
        <tr>
          <th align="center" valign="middle">Image</th>
          <th align="center" valign="middle">Item Name</th>
          <th align="center" valign="middle">Qty</th>
          <th align="center" valign="middle">Duration / Schedule</th>
          <th align="center" valign="middle">Price</th>
        </tr>
        ${itemsHtml}
      </table>


      <h3>Shipping Address</h3>
      <p>
        ${order.shipping_address.firstName} ${order.shipping_address.lastName}<br/>
        ${order.shipping_address.address}<br/>
        ${order.shipping_address.city}, ${order.shipping_address.state} - ${order.shipping_address.zipCode}<br/>
        Phone: ${order.shipping_address.phone}
      </p>

      <p>We will notify you once your order is shipped.</p>
      <p>Thank you for choosing us.</p>
    `
  };

  await transporterEmailVerification.sendMail(mailOptions);
};


export const paynow = async (req, res) => {
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

    await sendOrderConfirmationMail({
      to: email,
      order: savedOrder
    });

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

