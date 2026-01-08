import express from "express";
import multer from "multer";
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import userAuth from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import { toggleStatus, deleteCustomer, listDeliveryBoys, addMenu, listAllMenu, editMenu, deleteMenu, addAdditionalItem, listAdditionalItems, editAdditionalItem, deleteAdditionalItem, getUserDetails, updateUserDetails, forgotPassword, addContactDetails, getContactDetails, updateContactDetails, changePassword, uploadProfileImage } from "../controllers/userDataController.js";

// Initialize dotenv to load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Initialize router
const userDataRouter = express.Router();

// Setup multer with memory storage for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Login user
userDataRouter.post("/toggle-status", upload.none(), userAuth, adminMiddleware, toggleStatus);
userDataRouter.post("/delete-customer", upload.none(), userAuth, adminMiddleware, deleteCustomer);
// List all delivery boys
userDataRouter.get("/list-delivery-boys", userAuth, adminMiddleware, listDeliveryBoys);
// Add menu
userDataRouter.post("/add-menu", upload.array("newImages", 10), userAuth, adminMiddleware, addMenu);
// Edit Menu
userDataRouter.put("/edit-menu/:_id", upload.array("newImages", 10), userAuth, adminMiddleware, editMenu );
// Delete Menu
userDataRouter.delete("/delete-menu", upload.none(), userAuth, adminMiddleware, deleteMenu);
// List All Menu
userDataRouter.get("/list-all-menu", userAuth, adminMiddleware, listAllMenu);

// Add Additional Item
// userDataRouter.post("/add-additional-item", upload.array("newImages", 10), userAuth, adminMiddleware, addAdditionalItem);
userDataRouter.post("/add-additional-item",userAuth,adminMiddleware,upload.array("newImages", 10),addAdditionalItem);
// List Additional Items
userDataRouter.get("/list-additional-items", userAuth, adminMiddleware, listAdditionalItems);

// Edit Additional Items
userDataRouter.put("/edit-additional-items/:_id", upload.array("newImages", 10), userAuth, adminMiddleware, editAdditionalItem );

// Delete Additional Items
userDataRouter.delete("/delete-additional-item", upload.none(), userAuth, adminMiddleware, deleteAdditionalItem);

// Get User Details
userDataRouter.get("/user-details", userAuth, getUserDetails);

// Update User Details
userDataRouter.post("/update-user-details", upload.single("profileImage"), userAuth, updateUserDetails);

// Update User Profile Picture
userDataRouter.post("/upload-user-profile", upload.single("profileImage"), userAuth, uploadProfileImage);

// Forgot Password API
userDataRouter.post("/forgot-password", upload.none(), forgotPassword);

// Change Password API
userDataRouter.post("/change-password", upload.none(), userAuth, changePassword);

// Add Contact Details
userDataRouter.post("/add-contact-details", userAuth, adminMiddleware, upload.single("newImages"), addContactDetails);

// List Contact Details
userDataRouter.get("/list-contact-details", getContactDetails);

// Edit Contact Details
userDataRouter.put("/edit-contact-details/:_id", userAuth, adminMiddleware, upload.single("logo"), updateContactDetails);
export default userDataRouter;
