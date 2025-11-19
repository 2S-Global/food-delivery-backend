import express from "express";
import multer from "multer";
import userAuth from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import { getTest, registerUser, loginUser, validtoken, registerCustomer, listCustomers } from "../controllers/AuthController.js"

// Initialize router
const AuthRouter = express.Router();

// Setup multer with memory storage for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

AuthRouter.get("/getTest", getTest);

// Register User
AuthRouter.post("/admin-register", upload.none(), registerUser);

// Register User
AuthRouter.post("/customer-register", upload.none(), registerCustomer);

//validate token
AuthRouter.get("/validtoken", userAuth, validtoken);

// Login user
AuthRouter.post("/login", upload.none(), loginUser);

// List all users who are Customers
AuthRouter.get("/list-customers", userAuth, adminMiddleware, listCustomers);

export default AuthRouter;