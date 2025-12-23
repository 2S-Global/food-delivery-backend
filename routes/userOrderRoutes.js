import express from "express";
import multer from "multer";
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import userAuth from "../middleware/authMiddleware.js";
import { listUserOrders, getUserOrderDetails } from "../controllers/userOrderController.js";

// Initialize dotenv to load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Initialize router
const userOrderRouter = express.Router();

// Setup multer with memory storage for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// List User Orders
userOrderRouter.get("/list-user-orders", userAuth, listUserOrders);

// List Order details API
userOrderRouter.get("/list-order-details", userAuth, getUserOrderDetails);

export default userOrderRouter;