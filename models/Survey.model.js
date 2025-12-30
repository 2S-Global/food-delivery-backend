import mongoose from "mongoose";

const SurveySchema = new mongoose.Schema(
  {
    fullName: String,
    email: String,
    accommodation: String,
    yearOfStudy: String,

    homemadeFrequency: String,
    mealTypes: [String],
    otherDiet: String,

    mealsPerWeek: String,
    mealPreference: String,
    portion: String,
    planType: String,

    dropoff: String,
    otherDropoff: String,
    deliveryTimes: [String],

    priceRange: String,
    paidExtras: [String],

    struggles: [String],
    otherStruggle: String,
    recommend: String,
    menuSuggestions: String,
    feedback: String,

    consent: Boolean,
  },
  { timestamps: true }
);

export default mongoose.models.Survey || mongoose.model("Survey", SurveySchema);
