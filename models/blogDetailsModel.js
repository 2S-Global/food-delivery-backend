import mongoose from "mongoose";

const blogDetailsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: [String],
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: Date,
      required: true,
      default: Date.now,
    },

    slug: {
      type: String,
      unique: true,
      index: true
    },

    isDel: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Generate slug automatically from title
blogDetailsSchema.pre("save", function (next) {
  if (this.title && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/ /g, "-")           // replace spaces with dashes
      .replace(/[^\w-]+/g, "");     // remove special characters
  }
  next();
});

export default mongoose.model("BlogDetails", blogDetailsSchema);