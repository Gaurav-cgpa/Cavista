import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { connectDB } from './db/db.js';
import realTimeRoute from './route/realTimeRoute.js';
import cron from "node-cron";
import { generateVitalsForPatient } from './utils/automaticCall.js';

dotenv.config();

console.log("Checking MONGO_URI:", process.env.MONGO_URI ? "LOADED" : "NOT FOUND (Using hardcoded backup)");

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

app.use("/api/real-time", realTimeRoute);

cron.schedule("*/3 * * * *", async () => {
  console.log("⏳ Running cron job (every 3 minutes)");
  await generateVitalsForPatient("P001");
});

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