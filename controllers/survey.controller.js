import Survey from "../models/Survey.model.js";

export const submitSurvey = async (req, res) => {
  try {
    const survey = await Survey.create(req.body);

    res.status(201).json({
      success: true,
      message: "Survey saved successfully",
      id: survey._id,
    });
  } catch (error) {
    console.error("Survey error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save survey",
    });
  }
};

export const getAllSurveys = async (req, res) => {
  try {
    const surveys = await Survey.find().sort({ createdAt: -1 }); // latest first

    res.status(200).json({
      success: true,
      count: surveys.length,
      data: surveys,
    });
  } catch (error) {
    console.error("Fetch surveys error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch surveys",
    });
  }
};

/* =========================
   GET SINGLE SURVEY BY ID
========================= */
export const getSurveyById = async (req, res) => {
  try {
    const { id } = req.params;

    const survey = await Survey.findById(id);

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: "Survey not found",
      });
    }

    res.status(200).json({
      success: true,
      data: survey,
    });
  } catch (error) {
    console.error("Fetch survey by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch survey",
    });
  }
};
