import dotenv from 'dotenv'
import {app} from './app.js'
dotenv.config()

import connectDB from "./db/index.js"
import express from "express"

// if (process.env.NODE_ENV === "production") {
//     // Serve static files from frontend (like React)
//     app.use(express.static("client/build"));
// }  

connectDB()
.then(()=>{
    
    app.listen(process.env.PORT||3000, ()=>{
        console.log(`Server is running on ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("MongoDB connection failed !!! :", err)
})
