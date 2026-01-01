import express from "express";
import {
  submitContactUs,
  getAllContactUs,
  updateContactStatus,
} from "../controllers/contactUsController.js";

import adminAuth from "../middleware/adminMiddleware.js";

const router = express.Router();

// Public
router.post("/", submitContactUs);

// Admin
router.get("/admin", adminAuth, getAllContactUs);
router.patch("/admin/:id", adminAuth, updateContactStatus);

export default router;
