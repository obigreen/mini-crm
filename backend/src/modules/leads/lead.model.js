import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ["new", "in_progress", "won", "lost"],
            default: "new",
        },
        source: {
            type: String,
            enum: ["landing", "chat", "ads", "manual", "telegram"],
            default: "landing",
        },
        comment: {
            type: String,
            trim: true,
        },
        manager: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

export const Lead = mongoose.model("Lead", leadSchema);
