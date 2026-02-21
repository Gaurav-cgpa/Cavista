import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect("mongodb+srv://ashitosh_k:cavista@cluster0.j5sqz.mongodb.net/health_data?retryWrites=true&w=majority&appName=Cluster0");

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("❌ Error in connecting to MongoDB:");
        console.error(error.message); 
        process.exit(1);
    }
};