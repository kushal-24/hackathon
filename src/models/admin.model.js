import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv"
dotenv.config({
    path: './env'
});

const adminSchema= new Schema({
    role: {
        type: String,
        enum: ["admin"],
        default: "admin",
        immutable: true,
    },
    fullName: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: [true,"This username is already taken"],
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: [true, "required"],
    },
    age: {
        type: Number,
        required: true,
    },
    dob:{
        type: Date,
        required: true,
    },
    pfp: {
        type: String,
    },
    refreshToken: {
        type: String,
    },
},{timestamps: true})


//MIDDLEWARE
adminSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();
    this.password= await bcrypt.hash(this.password, 10);
    next()
})

//custom methods
adminSchema.methods.isPasswordCorrect= async function(password) {
    return await bcrypt.compare(password, this.password); //Returns t/f
}

//accessToken
adminSchema.methods.generateAccessToken= async function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName,
            dob: this.dob,
            age: this.age,
            role: this.role,
        },
        process.env.ACCESS_TOKEN_SECRET, 
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        },
    )
}
adminSchema.methods.generateRefreshToken= async function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName,
            dob: this.dob,
            age: this.age,
            role: this.role,
        },
        process.env.REFRESH_TOKEN_SECRET, 
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        },
    )
}

export const Admin= mongoose.model("admins", adminSchema);