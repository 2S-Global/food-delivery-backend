import express from 'express';
import multer from "multer";
import { createOrder } from "../controllers/paymentController.js";
import userAuth from "../middleware/authMiddleware.js";

const router = express.Router();

// Setup multer with memory storage for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Route to create order
router.post('/create-order', upload.none(), userAuth, createOrder);

export default router;