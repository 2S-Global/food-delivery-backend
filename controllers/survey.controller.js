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
