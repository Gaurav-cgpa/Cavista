import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import chatRoutes from "./route/chatRoute.js";

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb+srv://ashitosh_k:cavista@cluster0.j5sqz.mongodb.net/health_data?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log(err));

app.use("/api/chat", chatRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});