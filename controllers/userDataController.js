import User from "../models/userModel.js";
import Menu from "../models/menuModel.js";
import AdditionalItem from "../models/additionalItemModel.js";
import ContactDetail from "../models/contactDetailsModel.js";
import { v2 as cloudinary } from 'cloudinary';
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
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
      item1,
      description1,
      item2,
      description2,
      item3,
      description3,
      item4,
      description4,
      description,
      dayType,
      mealType,
    } = req.body;


    console.log("Here is my all data---------", req.body);

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

    // if (!dayType) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Day is required",
    //   });
    // }

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
      item1,
      description1: isQuillEmpty(description1) ? "" : description1,
      item2,
      description2: isQuillEmpty(description2) ? "" : description2,
      item3,
      description3: isQuillEmpty(description3) ? "" : description3,
      item4,
      description4: isQuillEmpty(description4) ? "" : description4,
      description: isQuillEmpty(description) ? "" : description,
      // dayType,
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
      item1,
      description1,
      item2,
      description2,
      item3,
      description3,
      item4,
      description4,
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
        item1,
        description1,
        item2,
        description2,
        item3,
        description3,
        item4,
        description4,
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
    }).select("menuName menuType description item1 description1 item2 description2 item3 description3 item4 description4 images dayType mealType createdAt");

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
export const addAdditionalItem123 = async (req, res) => {
  try {
    const {
      itemName,
      itemPrice,
      description,
    } = req.body;

    console.log("Body:", req.body);
    console.log("Files:", req.files);
    console.log("Files length:", req.files?.length);




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

      console.log("Uploading file new issue by Chandra : ", file.originalname);

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

export const addAdditionalItem = async (req, res) => {
  try {
    const { itemName, itemPrice, description } = req.body;

    console.log("Body:", req.body);
    console.log("Files:", req.files);
    console.log("Files length:", req.files?.length);

    // Basic validation
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

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required",
      });
    }

    const uploadedImages = [];

    for (const file of req.files) {
      if (!file.buffer) {
        return res.status(400).json({
          success: false,
          message: "Invalid image file",
        });
      }

      console.log("Uploading file:", file.originalname);

      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "additionalitems" },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        stream.end(file.buffer);
      });

      uploadedImages.push(uploadResult.secure_url);
    }

    const newItem = new AdditionalItem({
      itemName,
      itemPrice,
      description,
      images: uploadedImages,
    });

    await newItem.save();

    return res.status(200).json({
      success: true,
      message: "Additional Item added successfully",
      data: newItem,
    });

  } catch (error) {
    console.error("Add Additional Item Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
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

// Edit Additional Item API
export const editAdditionalItem = async (req, res) => {
  try {

    const { _id } = req.params;

    const {
      itemName,
      itemPrice,
      description,
      oldImages = []   // whatever images user kept
    } = req.body;

    if (!itemName || !itemPrice) {
      return res.status(400).json({
        success: false,
        message: "Item Name and Item Price are required",
      });
    }

    // New uploaded images (from Multer)
    const uploadedNewImages = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream({ folder: "additionalitems" }, (err, uploadResult) => {
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
    const updatedItem = await AdditionalItem.findByIdAndUpdate(
      _id,
      {
        itemName,
        itemPrice,
        description,
        images: finalImages,
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Additional Item updated successfully",
      data: updatedItem,
    });

  } catch (error) {
    console.log("Edit Additional Item Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Delete Additional Item API
export const deleteAdditionalItem = async (req, res) => {
  try {
    const { _id } = req.query;

    console.log("Delete Additional Item ID:", _id);

    // Validate and convert companyId to ObjectId
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res
        .status(400)
        .json({ success: false, message: `Invalid Additional Item ID` });
    }

    const objectId = new mongoose.Types.ObjectId(_id);

    // Find and update the company
    const deletedItem = await AdditionalItem.findOneAndUpdate(
      { _id: objectId, isDel: false },
      { isDel: true, updatedAt: new Date() },
      { new: true }
    );

    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: `Additional Item not found or already deleted`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Additional Item deleted successfully`,
      data: deletedItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting Additional Item",
      error: error.message,
    });
  }
};

// Get User Details
export const getUserDetails = async (req, res) => {
  try {
    // userId comes from JWT (set in auth middleware)
    const userId = req.userId;

    const user = await User.findById(userId).select(
      "-password -__v"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User details fetched successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user details",
      error: error.message,
    });
  }
};

// Update User Details
export const updateUserDetails = async (req, res) => {
  try {
    const userId = req.userId;

    const {
      name,
      email,
      phone_number,
      country,
      state,
      city,
      address,
    } = req.body;

    const updateData = {};

    if (name) updateData.name = name;
    // if (email) updateData.email = email;
    // if (phone_number) updateData.phone_number = phone_number;
    if (country) updateData.country = country;
    if (state) updateData.state = state;
    if (city) updateData.city = city;
    if (address) updateData.address = address;

    // Upload only if file exists
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { folder: "profile_images" },
            (err, uploadResult) => {
              if (err) reject(err);
              else resolve(uploadResult);
            }
          )
          .end(req.file.buffer);
      });

      updateData.profilePicture = result.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password -__v");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

// Reset Password API

// Generate random secure password
const generatePassword = () => {
  return (
    Math.random().toString(36).slice(-5) +
    "@" +
    Math.floor(10 + Math.random() * 90)
  );
};

// Send reset password email
const sendResetPasswordEmail = async (email, name, newPassword) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true, // true if using 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Food Go" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Password Reset Request",
    html: `
      <p><img src="https://res.cloudinary.com/da4unxero/image/upload/v1765973312/profile_images/frpev7nwwzig1fmamka5.jpg" width="150"/></p>
      <p>Hello ${name},</p>
      <p>You requested a password reset.</p>
      <p>Your new auto-generated password is:</p>
      <h3>${newPassword}</h3>
      <p>Please login and change your password immediately.</p>
    `,
  });
};

// Forgot Password API
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user found with this email",
      });
    }

    const newPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    await sendResetPasswordEmail(
      user.email,
      user.name || "User",
      newPassword
    );

    return res.status(200).json({
      success: true,
      message: "New password has been sent to your email",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Add Contact Details
export const addContactDetails = async (req, res) => {
  try {
    console.log("Conatct Details API Running Successfully ! ");
    const { email, phone_number, address, short_description, facebook_link, twitter_link } = req.body;
    console.log("Conatct Details API Running Successfully and here is my all data ! ", req.body);

    if (!email || !phone_number || !address) {
      return res.status(400).json({ success: false, message: "Email, phone number & address are required" });
    }

    const existing = await ContactDetail.findOne({ email });
    if (existing) {
      return res.status(404).json({ success: false, message: "Email already exists" });
    }

    let logoUrl = null;

    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "userLogos" },
          (err, result) => err ? reject(err) : resolve(result)
        ).end(req.file.buffer);
      });

      logoUrl = uploadResult.secure_url;
    }

    // Create New Contact Record
    const contact = await ContactDetail.create({
      email,
      phone_number,
      address,
      logo: logoUrl,
      short_description: short_description || "",
      social_links: {
        facebook: facebook_link || "",
        twitter: twitter_link || ""
      }
    });

    res.status(201).json({
      success: true,
      message: "Contact details added successfully",
      data: contact
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

//List Contact Details
export const getContactDetails = async (req, res) => {
  try {
    const contacts = await ContactDetail.find({ isDel: false })
      .select("email phone_number address logo short_description social_links createdAt updatedAt");

    if (!contacts.length) {
      return res.status(404).json({
        success: false,
        message: "No contact records found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Contact details fetched successfully",
      data: contacts
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Edit Contact Details
export const updateContactDetails = async (req, res) => {
  try {
    const { _id } = req.params;   // ID will come from URL
    const { email, phone_number, address, short_description, facebook_link, twitter_link, oldLogo } = req.body;

    console.log("Update Contact ID:", _id);
    console.log("Received Body:", req.body);

    // Check if record exists
    const existing = await ContactDetail.findById(_id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Contact record not found"
      });
    }

    let logoUrl = existing.logo;   // default keep old logo

    // If new logo uploaded -> upload to Cloudinary and replace
    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "userLogos" },
          (err, result) => err ? reject(err) : resolve(result)
        ).end(req.file.buffer);
      });

      logoUrl = uploadResult.secure_url;
    } 
    // else if oldLogo passed -> keep same
    else if (oldLogo) {
      logoUrl = oldLogo;
    }

    // Update record
    const updated = await ContactDetail.findByIdAndUpdate(
      _id,
      {
        email,
        phone_number,
        address,
        logo: logoUrl,
        short_description,
        social_links: {
          facebook: facebook_link || "",
          twitter: twitter_link || ""
        }
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Contact details updated successfully",
      data: updated
    });

  } catch (error) {
    console.error("Update Contact Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};
