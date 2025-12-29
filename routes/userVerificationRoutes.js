import express from 'express';
import multer from 'multer';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

import { paynow } from "../controllers/userVerificationController.js";

//Middleware
import userAuth from '../middleware/authMiddleware.js';


// Initialize dotenv to load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Initialize router
const userRouter = express.Router();

// Setup multer with memory storage for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// userRouter.post('/list_verified_users', upload.none(), userAuth, Companymid, listUserVerifiedList);

userRouter.post("/paynow", upload.none(), userAuth, paynow );


export default userRouter;