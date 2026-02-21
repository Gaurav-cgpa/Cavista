import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { connectDB } from './db/db.js';
import authRoute from './route/authRoute.js';
import userRoute from './route/userRoute.js';
import elevenlabsRoute from './route/elevenlabsRoute.js';


dotenv.config();


console.log("Checking MONGO_URI:", process.env.MONGO_URI ? "LOADED" : "NOT FOUND");

const PORT = process.env.PORT || 5000;
const app = express();


app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: "*",
    credentials: true,
}));


app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/elevenlabs", elevenlabsRoute);

const startServer = async () => {
    try {

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