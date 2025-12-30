import mongoose from "mongoose";

const cmsDetailsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      required: true,
    },

    summary: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250
    },

    full_content: {
      type: String,
      required: true,
      trim: true,
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


// Auto-generate slug from title
cmsDetailsSchema.pre("save", function (next) {
  if (this.title && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");
  }
  next();
});


export default mongoose.model("CmsDetails", cmsDetailsSchema);
