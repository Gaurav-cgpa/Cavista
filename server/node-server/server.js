import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { connectDB } from './db/db.js';
import authRoute from './route/authRoute.js';
import userRoute from './route/userRoute.js';

// 1. Load environment variables
dotenv.config();

// 2. Debug Check (Remove this after it works)
console.log("Checking MONGO_URI:", process.env.MONGO_URI ? "LOADED" : "NOT FOUND");

const PORT = process.env.PORT || 5000;
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: "http://localhost:8081",
    credentials: true,
}));

// Routes
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);

const startServer = async () => {
    try {
        // Only attempt connection if URI exists
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is missing from your .env file!");
        }

        await connectDB();
        
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port: ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Failed to start server:", error.message);
        process.exit(1); 
    }
};

startServer();