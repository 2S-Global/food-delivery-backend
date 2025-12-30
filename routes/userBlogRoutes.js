import express from "express";
import multer from "multer";
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import userAuth from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import { addBlogDetails, listAllBlogs, editUserBlog, deleteUserBlog, blogDetails, addCmsDetails, getCmsDetailsBySlug, editCmsDetails, deleteCmsDetails } from "../controllers/userBlogController.js";

// Initialize dotenv to load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Initialize router
const userBlogRouter = express.Router();

// Setup multer with memory storage for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Add User Blog
userBlogRouter.post("/add-user-blog", userAuth, adminMiddleware, upload.array("newImages", 10), addBlogDetails);

// List All Blogs
userBlogRouter.get("/list-user-blogs", listAllBlogs);

// List Blogs Details
userBlogRouter.get("/blog-details", blogDetails);

// Edit User Blog
userBlogRouter.put("/edit-user-blog/:_id", upload.array("newImages", 10), userAuth, adminMiddleware, editUserBlog);

// Delete User Blogs
userBlogRouter.delete("/delete-user-blog", upload.none(), userAuth, deleteUserBlog);

// Add CMS
userBlogRouter.post("/add-cms", userAuth, adminMiddleware, upload.single("image"), addCmsDetails);

// List CMS
userBlogRouter.get("/list-cms", getCmsDetailsBySlug);

// Edit CMS
userBlogRouter.put("/edit-cms/:_id", upload.single("image"), userAuth, adminMiddleware, editCmsDetails);

// Delete CMS
userBlogRouter.delete("/delete-cms/:_id", upload.none(), userAuth, adminMiddleware, deleteCmsDetails);

export default userBlogRouter;