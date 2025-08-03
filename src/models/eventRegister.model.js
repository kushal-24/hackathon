import mongoose, { Schema } from "mongoose";

const eventRegisterSchema = new Schema({
    eventTitle: {
        type: String,
        required: true
    },
    organisedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin"
    },
    mode: {
        type: String,
        enum: ["online", "offline", "hybrid"],//cool
        required: true
    },
    coverImg: {
        type: String,
        required: true
    },
    logo: {
        type: String,
        required: true
    },
    themeTags: {
        type: [String], // array of tags like ["AI", "Blockchain"]
        required: true,
        default:[],
    },
    registrationsStart: {
        type: String,
        required: true
    },
    registrationsDeadline: {
        type: String,
        required: true
    },

    eventStarts: {
        type: String,
        required: true
    },

    eventEnds: {
        type: String,
        required: true
    },
    aboutEvent: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    prizePool: {
        type: String, // or Number if you want to store as a fixed amount
        required: true
    },
    contactOC: {
        type: String, // email or phone or both
        required: true
    },
    isRegOpen: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

export const EventRegister = mongoose.model("eventregisters", eventRegisterSchema)