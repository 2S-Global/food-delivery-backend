import express from "express";
import multer from "multer";
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import userAuth from "../middleware/authMiddleware.js";
// import adminMiddleware from "../middleware/adminMiddleware.js";

import {userAddToCart, getUserCart, deleteUserCart, checkoutPay, getUserCartCount} from "../controllers/userCartController.js"

// Initialize dotenv to load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Initialize router
const userCartRouter = express.Router();

// Setup multer with memory storage for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Add User API
userCartRouter.post("/user-addtocart", upload.none(), userAuth, userAddToCart);

// List User Cart API
userCartRouter.get("/list-usercart", userAuth, getUserCart);

// Delete user cart API
userCartRouter.delete("/delete-usercart", upload.none(), userAuth, deleteUserCart);

// Checkout API
userCartRouter.get("/checkout-pay", upload.none(), userAuth, checkoutPay);

// Get Cart count API
userCartRouter.get("/user-cart-count", userAuth, getUserCartCount);

export default userCartRouter;