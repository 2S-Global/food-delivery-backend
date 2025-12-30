import express from "express";
import {
  submitSurvey,
  getAllSurveys,
  getSurveyById,
} from "../controllers/survey.controller.js";

const router = express.Router();

router.post("/submit", submitSurvey);      // Submit survey
router.get("/", getAllSurveys);             // Get all surveys
router.get("/:id", getSurveyById);           // Get single survey by ID
export default router;
