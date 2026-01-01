import blogDetailsModel from "../models/blogDetailsModel.js";
import cmsDetailsModel from "../models/cmsModel.js";
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

    console.log("Here I am getting all data: ", req.body);

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

      //   console.log("Uploading file:", file.originalname);

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
    }).select("title description image date slug");

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

// List Blog Details Controller
export const blogDetails = async (req, res) => {
  try {
    const { _id } = req.query; // expecting blog id from query

    if (!_id) {
      return res.status(400).json({
        success: false,
        message: "Blog _id is required"
      });
    }

    const blog = await blogDetailsModel.findOne({
      _id,
      isDel: false
    }).select("title description image date slug");

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Blog details fetched successfully",
      data: blog
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching blog details",
      error: error.message
    });
  }
};

//Edit User Blog Controller
export const editUserBlog123 = async (req, res) => {
  try {
    const { _id } = req.params;

    const {
      title,
      date,
      description,
      oldImages = []   // whatever images user kept
    } = req.body;

    console.log("Here I am receiving all req.body :", req.body);

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
    const updatedItem = await blogDetailsModel.findByIdAndUpdate(
      _id,
      {
        title,
        date,
        description,
        images: finalImages,
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Blog Details updated successfully",
      data: updatedItem,
    });

  } catch (error) {
    console.log("Edit Blog Details Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const editUserBlog = async (req, res) => {
  try {
    const { _id } = req.params;

    let { title, date, description, oldImages } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and Description are required",
      });
    }

    // Parse old images coming as JSON string
    try {
      oldImages = JSON.parse(oldImages);
    } catch {
      oldImages = Array.isArray(oldImages) ? oldImages : [oldImages];
    }
    if (!Array.isArray(oldImages)) oldImages = [];

    // Upload new images
    const uploadedNewImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream({ folder: "blogImages" }, (err, uploadResult) => {
            if (err) reject(err);
            else resolve(uploadResult);
          }).end(file.buffer);
        });
        uploadedNewImages.push(result.secure_url);
      }
    }

    const finalImages = [...oldImages, ...uploadedNewImages];

    const updatedBlog = await blogDetailsModel.findByIdAndUpdate(
      _id,
      { title, date, description, image: finalImages },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      data: updatedBlog,
    });

  } catch (error) {
    console.log("Edit Blog Error:", error);
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

// Add CMS Controller
export const addCmsDetails = async (req, res) => {
  try {
    const { title, summary, description } = req.body;

    console.log("Here I am getting all data: ", req.body);

    if (!title || !summary || !description) {
      return res.status(400).json({
        success: false,
        message: "Title, Summary & Description are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image is required",
      });
    }

    // Upload image to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder: "cmsImages" }, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }).end(req.file.buffer);
    });

    // Save data
    const newCMS = await cmsDetailsModel.create({
      title,
      summary,
      full_content: description,
      image: uploadResult.secure_url,
    });

    return res.status(200).json({
      success: true,
      message: "CMS Blog Added Successfully",
      data: newCMS,
    });

  } catch (err) {
    console.error("CMS Add Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

// List CMS Details by Slug Controller
export const getCmsDetailsBySlug = async (req, res) => {
  try {
    const { slug } = req.query;

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Slug is required",
      });
    }

    const cmsData = await cmsDetailsModel.findOne({
      slug,
      isDel: false
    });

    if (!cmsData) {
      return res.status(404).json({
        success: false,
        message: "CMS content not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "CMS details fetched successfully",
      data: cmsData,
    });

  } catch (err) {
    console.error("CMS Fetch Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

// Edit CMS Controller
export const editCmsDetails = async (req, res) => {
  try {
    const { _id } = req.params;
    const { title, summary, description, oldImage } = req.body;

    console.log("Editing CMS ID:", _id);
    console.log("Here I am receiving all req.body for edit :", req.body);

    if (!title || !summary || !description) {
      return res.status(400).json({
        success: false,
        message: "Title, Summary & Description are required",
      });
    }

    // STEP 1: Get existing CMS to fallback to old image if needed
    const existingCMS = await cmsDetailsModel.findById(_id);
    if (!existingCMS) {
      return res.status(404).json({
        success: false,
        message: "CMS Blog not found",
      });
    }

    let finalImage = existingCMS.image;

    // If new image uploaded, replace image
    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "cmsImages" },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        ).end(req.file.buffer);
      });

      finalImage = uploadResult.secure_url;
    } else if (oldImage) {
      finalImage = oldImage;
    }

    const updatedCMS = await cmsDetailsModel.findByIdAndUpdate(
      _id,
      {
        title,
        summary,
        full_content: description,
        image: finalImage,
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "CMS Blog Updated Successfully",
      data: updatedCMS,
    });

  } catch (err) {
    console.error("CMS Update Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

// Delete CMS Controller
export const deleteCmsDetails = async (req, res) => {
  try {
    const { _id } = req.params;

    const deletedCMS = await cmsDetailsModel.findByIdAndUpdate(
      _id,
      { isDel: true },            // soft delete flag
      { new: true }
    );

    if (!deletedCMS) {
      return res.status(404).json({
        success: false,
        message: "CMS Blog not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "CMS Deleted Successfully",
      data: deletedCMS,
    });

  } catch (error) {
    console.error("Delete CMS Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Lis all CMS only for Admin Panel
export const listAllCMS = async (req, res) => {
  try {
    // Fetch all users with role 1 and not deleted
    const allCms = await cmsDetailsModel.find({
      isDel: false
    }).select("title image summary slug full_content");

    // If no data found
    if (!allCms.length) {
      return res.status(404).json({
        success: false,
        message: "No CMS found"
      });
    }

    // Map all CMS records and format output
    const cmsData = allCms.map(cms => ({
      _id: cms._id,
      title: cms.title,
      image: cms.image,
      summary: cms.summary,
      slug: cms.slug,
      description: cms.full_content // renamed key
    }));

    // Success response
    return res.status(200).json({
      success: true,
      message: "All CMS retrieved successfully",
      data: cmsData
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching cms",
      error: error.message
    });
  }
};