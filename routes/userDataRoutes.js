import express from "express";
import multer from "multer";
import userAuth from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import { toggleStatus, deleteCustomer } from "../controllers/userDataController.js"

// Initialize router
const userDataRouter = express.Router();

// Setup multer with memory storage for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Login user
userDataRouter.post("/toggle-status", upload.none(), userAuth, adminMiddleware, toggleStatus);
userDataRouter.post("/delete-customer", upload.none(), userAuth, adminMiddleware, deleteCustomer);

export default userDataRouter;