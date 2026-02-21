import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { connectDB } from './db/db.js';
import authRoute from './route/authRoute.js';
import userRoute from './route/userRoute.js';
import elevenlabsRoute from './route/elevenlabsRoute.js';
import whatsappRoute from './route/whatsappRoute.js';
import telegramRoute from './route/telegramRoute.js';
import translateRoute from './route/translateRoute.js';
import chatRoute from './route/chatRoute.js';
import realTimeRoute from './route/realTimeRoute.js';
import { generateAndStoreVitals } from './controller/dynamicInfoController.js';
import cron from "node-cron";
import chatRoute from './route/chatRoute.js';


dotenv.config();


console.log("Checking MONGO_URI:", process.env.MONGO_URI ? "LOADED" : "NOT FOUND");

const PORT = process.env.PORT || 5000;
const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
    origin: "*",
    credentials: true,
}));

cron.schedule("*/1 * * * *", async () => {
    console.log("⏳ Running cron job (every 3 minutes)");
    await generateAndStoreVitals("6999eb5370efa3e840b7ba71");
});

app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/chat", chatRoute);
app.use("/api/elevenlabs", elevenlabsRoute);
app.use("/api/whatsapp", whatsappRoute);
app.use("/api/telegram", telegramRoute);
app.use("/api/translate", translateRoute);
app.use("/api/realtime", realTimeRoute);
app.use("/api/chat", chatRoute);

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