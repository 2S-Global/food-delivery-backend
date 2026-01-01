import mongoose from "mongoose";

const contactDetailSchema = new mongoose.Schema(
    {

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"]
        },

        phone_number: {
            type: String,
            required: true,
            trim: true,
            match: [/^[0-9]{10}$/, "Phone number must be 10 digits"]
        },

        address: {
            type: String,
            required: true,
            trim: true,
            default: ""
        },

        short_description: {
            type: String,
            trim: true,
            maxLength: 300,
            default: ""
        },

        logo: {
            type: String,            // store image URL
            required: false,
            default: null
        },

        social_links: {
            facebook: {
                type: String,
                trim: true,
                default: "",
                match: [/^(http|https):\/\/[^ "]+$/, "Invalid Facebook URL"]
            },
            twitter: {
                type: String,
                trim: true,
                default: "",
                match: [/^(http|https):\/\/[^ "]+$/, "Invalid Twitter URL"]
            }
        },

        isDel: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

export default mongoose.model("ContactDetail", contactDetailSchema);
