import dotenv from 'dotenv';
import { app } from './app';
dotenv.config();

import connectDB from "./db/index.js"
import express from "express"

connectDB()
.then(()=>{
    
    app.listen(process.env.PORT||3000, ()=>{
        console.log(`Server is running on ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("MongoDB connection failed !!! :", err)
})