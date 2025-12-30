import express from "express";
import multer from "multer";
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import userAuth from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import { addBlogDetails, listAllBlogs, editUserBlog, deleteUserBlog, blogDetails } from "../controllers/userBlogController.js";

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

// All List Menu API
// userMenuRouter.get("/list-menu", listUserMenu);
// Item details API
// userMenuRouter.get("/item-details", getItemDetailsById);
// List Meal Type API
// userMenuRouter.get("/list-meal-type", listMealType);
// API for Add Subscription Price
// userBlogRouter.post("/add-user-blog", upload.none(), userAuth, adminMiddleware, addSubscriptionPrice);

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

// List all count for this api
// userMenuRouter.get("/list-item-count", listAllItemCount);

export default userBlogRouter;