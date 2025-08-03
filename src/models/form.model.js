import mongoose, { Schema } from "mongoose";

const formSchema = new Schema({
    eventId: {
        type: Schema.Types.ObjectId,
        ref: "EventRegister"
    },
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    mobileNo: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: ["male", "female", "other"],
        required: true
    },
    age: {
        type: Number,
        required: true
    },
}, { timestamps: true });



export const Form = mongoose.model("forms", formSchema);
