import blogDetailsModel from "../models/blogDetailsModel.js";
import { v2 as cloudinary } from 'cloudinary';
import mongoose from "mongoose";

// Helper Function to check if Quill editor content is empty
const isQuillEmpty = (value) => {
  if (!value) return true;

  const cleaned = value.replace(/<(.|\n)*?>/g, "").trim();
  return cleaned.length === 0;
};

// Add user Blog Controller
export const addBlogDetails = async (req, res) => {
  try {
    const { title, description } = req.body;

    console.log("Body:", req.body);
    console.log("Files:", req.files);
    console.log("Files length:", req.files?.length);

    // Basic validation
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and Description are required",
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
          { folder: "blogImages" },
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

    const newItem = new blogDetailsModel({
      title,
      description,
      image: uploadedImages,
    });

    await newItem.save();

    return res.status(200).json({
      success: true,
      message: "Blog Details added successfully",
      data: newItem,
    });

  } catch (error) {
    console.error("Blog Details Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// List User Blogs Controller
export const listAllBlogs = async (req, res) => {
  try {
    // Fetch all users with role 1 and not deleted
    const allBlogs = await blogDetailsModel.find({
      isDel: false
    }).select("title description image date");

    // If no data found
    if (!allBlogs.length) {
      return res.status(404).json({
        success: false,
        message: "No Blog found"
      });
    }

    // Success response
    return res.status(200).json({
      success: true,
      message: "All Blogs retrieved successfully",
      data: allBlogs
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching blogs",
      error: error.message
    });
  }
};

//Edit User Blog Controller
export const editUserBlog = async (req, res) => {
  try {

    const { _id } = req.params;

    const {
      title,
      description,
      oldImages = []   // whatever images user kept
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and Description are required",
      });
    }

    // New uploaded images (from Multer)
    const uploadedNewImages = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream({ folder: "blogImages" }, (err, uploadResult) => {
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

// Delete User Blog Controller
export const deleteUserBlog = async (req, res) => {
  try {
    const { _id } = req.query;

    console.log("Delete User Blogs:", _id);

    // Validate and convert companyId to ObjectId
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res
        .status(400)
        .json({ success: false, message: `Invalid user blog ID` });
    }

    const objectId = new mongoose.Types.ObjectId(_id);

    // Find and update the company
    const deletedItem = await blogDetailsModel.findOneAndUpdate(
      { _id: objectId, isDel: false },
      { isDel: true, updatedAt: new Date() },
      { new: true }
    );

    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: `User Blog not found or already deleted`,
      });
    }

    res.status(200).json({
      success: true,
      message: `User Blog deleted successfully`,
      data: deletedItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting User Blog",
      error: error.message,
    });
  }
};