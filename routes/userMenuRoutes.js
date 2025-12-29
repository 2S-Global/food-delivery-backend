import express from "express";
import multer from "multer";
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import userAuth from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import {listUserMenu, getItemDetailsById, addSubscriptionPrice, listMealType, listAllItemCount} from "../controllers/userMenuController.js";

// Initialize dotenv to load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Initialize router
const userMenuRouter = express.Router();

// Setup multer with memory storage for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// All List Menu API
userMenuRouter.get("/list-menu", listUserMenu);
// Item details API
userMenuRouter.get("/item-details", getItemDetailsById);
// List Meal Type API
userMenuRouter.get("/list-meal-type", listMealType);
// API for Add Subscription Price
userMenuRouter.post("/add-subscription-price", upload.none(), userAuth, adminMiddleware, addSubscriptionPrice);

// List all count for this api
userMenuRouter.get("/list-item-count", listAllItemCount);

export default userMenuRouter;