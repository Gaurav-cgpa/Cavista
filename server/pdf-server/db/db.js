import mongoose from "mongoose";

export const connectDB=async()=>{
    try {
        const conn=await mongoose.connect("mongodb+srv://ashitosh_k:cavista@cluster0.j5sqz.mongodb.net/health_data?retryWrites=true&w=majority&appName=Cluster0");

        console.log(`Mongo db is connected: ${conn.connection.host}`);
    } catch (error) {
        console.log("Error in connecting mongo db");
        console.error(error.message);
        process.exit(1);
    }
};