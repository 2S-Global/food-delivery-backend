export const listUserOrders = async (req, res) => {
  try {
    const userId = req.userId; // coming from auth middleware

    const orders = await AllOrdersData.find({
      user_id: userId,
    })
      .sort({ createdAt: -1 }); // latest first

    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: orders,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
};
