import bcrypt from "bcrypt";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const getTest = async (req, res) => {
  try {

    res.json({ success: true, data: "Food Delivery First API is Running Successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Register a new user
export const registerUser = async (req, res) => {
  try {

    console.log("REQUEST BODY:", req.body);  // <-- Debug


    // dotenv.config();
    const { name, email, password, phone_number } = req.body;
    const role = 0;
    // Validate required fields
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email, is_del: false });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password before saving
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Formatting Phone Number
    const phoneNumber = parsePhoneNumberFromString(phone_number, "IN");

    if (!phoneNumber || !phoneNumber.isValid()) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number",
      });
    }

    // ✅ Store in DB (E.164 format)
    const dbPhoneNumber = phoneNumber.number;

    // Create a new user with hashed password
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      phone_number: dbPhoneNumber,
    });
    await newUser.save();
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(201).json({
      success: true,
      message: "User registered and logged in successfully!",
      token,
      data: newUser,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
};

// Customer Register
export const registerCustomer = async (req, res) => {
  try {
    console.log("REQUEST BODY:", req.body);  // <-- Debug

    // dotenv.config();
    const { name, email, password, phone_number } = req.body;
    const role = 1;
    // Validate required fields
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email, is_del: false });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password before saving
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Formatting Phone Number
    const phoneNumber = parsePhoneNumberFromString(phone_number, "IN");

    if (!phoneNumber || !phoneNumber.isValid()) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number",
      });
    }

    // ✅ Store in DB (E.164 format)
    const dbPhoneNumber = phoneNumber.number;

    // Create a new user with hashed password
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      phone_number: dbPhoneNumber,
    });
    await newUser.save();
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(201).json({
      success: true,
      message: "User registered and logged in successfully!",
      token,
      data: newUser,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
};

// Login a user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({
      email,
      is_active: true,
      is_del: false,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials or account not active.",
        success: false,
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Your Email is not Verified.Please Verify it first.",
        success: false,
      });
    }

    // If password is hashed, compare using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);

    // If passwords don't match
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
        success: false,
      });
    }

    // Build payload
    // let payload = { userId: user._id };

    // If employer role, add companyId
    // if (user.role === 2 && user.company_id) {
    //   payload.companyId = user.company_id;
    // }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, companyId: user.company_id },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );

    res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      data: user,
      role: user.role,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error logging in user", error: error.message });
  }
};

// List Customers
export const listCustomers = async (req, res) => {
  try {
    // Fetch all users with role 1 and not deleted
    const candidates = await User.find({
      role: 1,
      is_del: false
    }).select("name email phone_number is_active createdAt");

    // If no data found
    if (!candidates.length) {
      return res.status(404).json({
        success: false,
        message: "No candidates found"
      });
    }

    // Format date + time to: 22/05/2025, 01:58 PM
    const formattedCandidates = candidates.map((item) => {
      const formattedDate = item.createdAt.toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      return {
        ...item._doc,
        createdAt: formattedDate,
      };
    });

    // Success response
    return res.status(200).json({
      success: true,
      message: "Candidates retrieved successfully",
      data: formattedCandidates
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching candidates",
      error: error.message
    });
  }
};

// Valid token
export const validtoken = async (req, res) => {
  try {
    const userId = req.userId;

    // Find user
    const user = await User.findById(userId);
    if (!user || user.is_del) {
      return res.status(404).json({
        message: "User not found.",
        success: false,
        isvalid: false,
      });
    }
    return res.status(200).json({
      message: "Token is valid.",
      success: true,
      isvalid: true,
    });
  } catch (error) {
    console.error("Error while validating token:", error);
    return res.status(500).json({
      message: "An error occurred while validating the token.",
      success: false,
      isvalid: false,
    });
  }
};