import ContactUs from "../models/contactUsModel.js";

// ===============================
// Submit Contact Us Form (Public)
// ===============================
export const submitContactUs = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email and message are required",
      });
    }

    await ContactUs.create({
      name,
      email,
      subject,
      message,
    });

    res.status(200).json({
      success: true,
      message: "Your message has been sent successfully",
    });
  } catch (error) {
    console.error("ContactUs Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ===============================
// Get All Messages (Admin)
// ===============================
export const getAllContactUs = async (req, res) => {
  try {
    const messages = await ContactUs.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ===============================
// Update Message Status (Admin)
// ===============================
export const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const message = await ContactUs.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
