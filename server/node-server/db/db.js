import mongoose from "mongoose";

export const connectDB=async()=>{
    try {
        const conn=await mongoose.connect(process.env.MONGO_URI);

        console.log(`Mongo db is connected: ${conn.connection.host}`);
    } catch (error) {
        console.log("Error in connecting mongo db");
        console.error(error.message);
        process.exit(1);
    }
};