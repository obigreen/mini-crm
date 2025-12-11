import mongoose from "mongoose";


const leadSchema = new mongoose.Schema({



    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        trim: true,
        // нужно ли это, вызывает вопрос
        lowercase: true,
    },

    phone: {
        type: String,
        trim: true,
    },

    status: {
        type: String,
        /*** @see /leads/lead-status-notes.md ***/

        enum: 'new',
        default: 'new'
    },

    source: {
        type: String,
        enum: ['landing', 'chat', 'ads', 'manual'],
        default: 'landing'
    },

    comment: {
        type: String,
        trim: true
    },

    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }


}, {
    timestamps: true, // автоматически создаёт createdAt и updatedAt
})


export const Lead = mongoose.model("lead", leadSchema);