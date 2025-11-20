import User from "../models/userModel.js";
import mongoose from "mongoose";
// Toggle Status
export const toggleStatus = async (req, res) => {
  try {
    const { user_id } = req.body;

    // Find the package first
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Toggle the is_active status
    const updated = await User.findByIdAndUpdate(
      user_id,
      {
        is_active: !user.is_active,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updated,
       message: `User Status Changed Successfully.`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating status",
      error: error.message,
    });
  }
};

// Delete Customers
export const deleteCustomer = async (req, res) => {
  try {
    const { customerId } = req.body;

    // Validate and convert companyId to ObjectId
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res
        .status(400)
        .json({ success: false, message: `Invalid User ID` });
    }

    const objectId = new mongoose.Types.ObjectId(customerId);

    // Find and update the company
    const deletedCompany = await User.findOneAndUpdate(
      { _id: objectId, is_del: false },
      { is_del: true, updatedAt: new Date() },
      { new: true }
    );

    if (!deletedCompany) {
      return res.status(404).json({
        success: false,
        message: `user not found or already deleted`,
      });
    }

    res.status(200).json({
      success: true,
      message: `User deleted successfully`,
      data: deletedCompany,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message,
    });
  }
};

// List delivery boys
export const listDeliveryBoys = async (req, res) => {
  try {
    // Fetch all users with role 1 and not deleted
    const candidates = await User.find({
      role: 2,
      is_del: false
    }).select("name email phone_number is_active createdAt");

    // If no data found
    if (!candidates.length) {
      return res.status(404).json({
        success: false,
        message: "No candidates found"
      });
    }

    // Format date + time to: 22/05/2025, 01:58 PM
    const formattedCandidates = candidates.map((item) => {
      const formattedDate = item.createdAt.toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      return {
        ...item._doc,
        createdAt: formattedDate,
      };
    });

    // Success response
    return res.status(200).json({
      success: true,
      message: "Candidates retrieved successfully",
      data: formattedCandidates
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching candidates",
      error: error.message
    });
  }
};