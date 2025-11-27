import User from "../models/userModel.js";
import Menu from "../models/menuModel.js";
import AdditionalItem from "../models/additionalItemModel.js";
import { v2 as cloudinary } from 'cloudinary';
import mongoose from "mongoose";

const isQuillEmpty = (value) => {
  if (!value) return true;

  const cleaned = value.replace(/<(.|\n)*?>/g, "").trim();
  return cleaned.length === 0;
};

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

// Add menu API
export const addMenu123 = async (req, res) => {
  try {

    const { menuName, menuType, description, dayType, mealType } =
      req.body;

    if (!menuName || !menuType || !description || !dayType || !mealType) {
      return res.status(400).json({ message: "All fields are required." });
    }


    console.log("Files received:", req.files);

    // Multer stores files in req.files
    // Check if at least one image exists
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "At least one image is required." });
    }

    // Array to store uploaded image URLs
    const uploadedImages = [];
    // Upload each file to Cloudinary
    for (const file of req.files) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "menus" }, (err, uploadResult) => {
            if (err) reject(err);
            else resolve(uploadResult);
          })
          .end(file.buffer);
      });

      uploadedImages.push(result.secure_url);
    }

    const menu = new Menu({
      menuName,
      menuType,
      description,
      dayType,
      mealType,
      images: uploadedImages,
    });

    await menu.save();

    // Success response
    return res.status(200).json({
      success: true,
      message: "Menu created successfully",
      data: menu,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating menu",
      error: error.message
    });
  }
};

// Add menu API
export const addMenu = async (req, res) => {
  try {
    const {
      menuName,
      menuType,
      description,
      dayType,
      mealType,
    } = req.body;

    if (!menuName || !menuType) {
      return res.status(400).json({
        success: false,
        message: "Name and Menu Type are required",
      });
    }

    if (isQuillEmpty(description)) {
      return res.status(400).json({
        success: false,
        message: "Description is required",
      });
    }

    if (!dayType) {
      return res.status(400).json({
        success: false,
        message: "Day is required",
      });
    }

    if (!mealType) {
      return res.status(400).json({
        success: false,
        message: "Meal Type is required",
      });
    }

    // Multer stores files in req.files
    // Check if at least one image exists
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "At least one image is required." });
    }

    // Array to store uploaded image URLs
    const uploadedImages = [];
    // Upload each file to Cloudinary
    for (const file of req.files) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "menus" }, (err, uploadResult) => {
            if (err) reject(err);
            else resolve(uploadResult);
          })
          .end(file.buffer);
      });

      uploadedImages.push(result.secure_url);
    }

    // menuName,
    // menuType,
    // description,
    // dayType,
    // mealType,
    // images: uploadedImages,

    const newMenu = new Menu({
      menuName,
      menuType,
      description: isQuillEmpty(description) ? "" : description,
      dayType,
      mealType,
      images: uploadedImages,
    });

    await newMenu.save();

    return res.status(200).json({
      success: true,
      message: "Menu added successfully",
      data: newMenu,
    });

  } catch (error) {
    console.log("Add Menu Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Edit menu API
export const editMenu = async (req, res) => {
  try {

    const { _id } = req.params;

    const {
      menuName,
      menuType,
      description,
      dayType,
      mealType,
      oldImages = []   // whatever images user kept
    } = req.body;

    if (!menuName || !menuType) {
      return res.status(400).json({
        success: false,
        message: "Name and Menu Type are required",
      });
    }

    // New uploaded images (from Multer)
    const uploadedNewImages = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream({ folder: "menus" }, (err, uploadResult) => {
              if (err) reject(err);
              else resolve(uploadResult);
            })
            .end(file.buffer);
        });

        uploadedNewImages.push(result.secure_url);
      }
    }

    // Final image list = oldImages (kept) + newImages (uploaded)
    const finalImages = [...oldImages, ...uploadedNewImages];

    // Update DB
    const updatedMenu = await Menu.findByIdAndUpdate(
      _id,
      {
        menuName,
        menuType,
        description,
        dayType,
        mealType,
        images: finalImages,
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Menu updated successfully",
      data: updatedMenu,
    });

  } catch (error) {
    console.log("Edit Menu Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// List All Menu
export const listAllMenu = async (req, res) => {
  try {
    // Fetch all users with role 1 and not deleted
    const allMenus = await Menu.find({
      isDel: false
    }).select("menuName menuType description images dayType mealType createdAt");

    // If no data found
    if (!allMenus.length) {
      return res.status(404).json({
        success: false,
        message: "No Menu found"
      });
    }

    // console.log("Here is my All Menu: ", allMenus);

    // // Format date + time to: 22/05/2025, 01:58 PM
    // const formattedCandidates = candidates.map((item) => {
    //   const formattedDate = item.createdAt.toLocaleString("en-GB", {
    //     day: "2-digit",
    //     month: "2-digit",
    //     year: "numeric",
    //     hour: "2-digit",
    //     minute: "2-digit",
    //     hour12: true,
    //   });

    //   return {
    //     ...item._doc,
    //     createdAt: formattedDate,
    //   };
    // });

    // Success response
    return res.status(200).json({
      success: true,
      message: "All Menu retrieved successfully",
      data: allMenus
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching candidates",
      error: error.message
    });
  }
};

// Delete Menu
export const deleteMenu = async (req, res) => {
  try {
    const { _id } = req.query;

    console.log("Delete Menu ID:", _id);

    // Validate and convert companyId to ObjectId
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res
        .status(400)
        .json({ success: false, message: `Invalid Menu ID` });
    }

    const objectId = new mongoose.Types.ObjectId(_id);

    // Find and update the company
    const deletedMenu = await Menu.findOneAndUpdate(
      { _id: objectId, isDel: false },
      { isDel: true, updatedAt: new Date() },
      { new: true }
    );

    if (!deletedMenu) {
      return res.status(404).json({
        success: false,
        message: `menu not found or already deleted`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Menu deleted successfully`,
      data: deletedMenu,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting menu",
      error: error.message,
    });
  }
};

// Add Additional Item API
export const addAdditionalItem = async (req, res) => {
  try {
    const {
      itemName,
      itemPrice,
      description,
    } = req.body;

    if (!itemName || !itemPrice) {
      return res.status(400).json({
        success: false,
        message: "Item Name and Item Price are required",
      });
    }

    if (isQuillEmpty(description)) {
      return res.status(400).json({
        success: false,
        message: "Description is required",
      });
    }

    // Multer stores files in req.files
    // Check if at least one image exists
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "At least one image is required." });
    }

    // Array to store uploaded image URLs
    const uploadedImages = [];
    // Upload each file to Cloudinary
    for (const file of req.files) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "additionalitems" }, (err, uploadResult) => {
            if (err) reject(err);
            else resolve(uploadResult);
          })
          .end(file.buffer);
      });

      uploadedImages.push(result.secure_url);
    }

    const newItem = new AdditionalItem({
      itemName,
      itemPrice,
      description: isQuillEmpty(description) ? "" : description,
      images: uploadedImages,
    });

    await newItem.save();

    return res.status(200).json({
      success: true,
      message: "Additional Item added successfully",
      data: newItem,
    });

  } catch (error) {
    console.log("Add Menu Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// List All Additional Items
export const listAdditionalItems = async (req, res) => {
  try {
    // Fetch all users with role 1 and not deleted
    const allItems = await AdditionalItem.find({
      isDel: false
    }).select("itemName itemPrice description images createdAt");

    // If no data found
    if (!allItems.length) {
      return res.status(404).json({
        success: false,
        message: "No Additional Item found"
      });
    }

    // Success response
    return res.status(200).json({
      success: true,
      message: "All Additional Items retrieved successfully",
      data: allItems
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching additional items",
      error: error.message
    });
  }
};