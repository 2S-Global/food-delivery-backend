import express from "express";
import {
  submitContactUs,
} from "../controllers/contactUsController.js";

import adminAuth from "../middleware/adminMiddleware.js";

const router = express.Router();

// Public
router.post("/", submitContactUs);

export default router;
