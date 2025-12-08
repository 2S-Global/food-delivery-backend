import express from "express";
import multer from "multer";
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import userAuth from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import { addOrder, listAllOrder, deleteOrder, listOrderItems, getOrderSummary, OrdersChartByStatus, RevenueByStatus, RevenueByDate, OrdersByDate, CustomersGrowth, DeliveryPartnersGrowth } from "../controllers/OrderController.js"

// Initialize dotenv to load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Initialize router
const addOrderRouter = express.Router();

// Setup multer with memory storage for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Login user
addOrderRouter.post("/add-order", upload.none(), userAuth, addOrder);
// List All Orders
addOrderRouter.get("/list-all-order", userAuth, adminMiddleware, listAllOrder);
// Delete Orders
addOrderRouter.post("/delete-order", upload.none(), userAuth, adminMiddleware, deleteOrder);
// List Order items
addOrderRouter.get("/list-order-items", userAuth, adminMiddleware, listOrderItems);
// Get Order Summary
addOrderRouter.get("/get-order-summary", userAuth, adminMiddleware, getOrderSummary);
// Get Order By Status
addOrderRouter.get("/orders-chart-by-status", userAuth, adminMiddleware, OrdersChartByStatus);
// Get Revenue By Status
addOrderRouter.get("/revenue-by-status", userAuth, adminMiddleware, RevenueByStatus);
// Get Revenue By Date
addOrderRouter.get("/revenue-by-date", userAuth, adminMiddleware, RevenueByDate);
// Get Orders By Date
addOrderRouter.get("/orders-by-date", userAuth, adminMiddleware, OrdersByDate);
// Get Customers By months
addOrderRouter.get("/customers-by-month", userAuth, adminMiddleware, CustomersGrowth);
// Get Delivery Partners By months
addOrderRouter.get("/delivery-partners-by-month", userAuth, adminMiddleware, DeliveryPartnersGrowth);

export default addOrderRouter;