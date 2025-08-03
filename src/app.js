import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app= express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))
app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit:"16kb"}));
app.use(express.static("public"))
app.use(cookieParser());

//route import
import adminRouter from "./routes/admin.routes.js"
import eventRouter from "./routes/adminEvent.routes.js"
import userRouter from "./routes/user.routes.js"

//routes declaraton
app.use('/api/v1/admin', adminRouter); 
app.use('/api/v1/event', eventRouter); 
app.use('/api/v1/user', userRouter); 



export {app}