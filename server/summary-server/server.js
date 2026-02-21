import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || "";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

if (!MONGO_URI) {
  console.warn("MONGO_URI not set. Set it in .env to connect to MongoDB.");
}
if (!GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY not set. Set it in .env to use Gemini.");
}

// User schema (matches existing User collection - patient profile)
const userSchema = new mongoose.Schema(
  {
    fullName: String,
    username: String,
    email: String,
    age: Number,
    gender: String,
    height: Number,
    weight: Number,
    dob: Date,
    bloodGroup: String,
    phoneNumber: String
  },
  { timestamps: true, strict: false }
);
const User = mongoose.models.User || mongoose.model("User", userSchema);

// Vitals schema (matches existing health_data collection)
const vitalsSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.Mixed, required: true },
    heartRate: Number,
    systolicBP: Number,
    diastolicBP: Number,
    glucose: Number,
    sleepHours: Number,
    timestamp: Date
  },
  { timestamps: true, strict: false }
);
const Vitals = mongoose.models.Vitals || mongoose.model("Vitals", vitalsSchema);

// Chat schema (matches existing Chat collection)
const messageSchema = new mongoose.Schema(
  { role: String, content: String },
  { _id: false }
);
const chatSchema = new mongoose.Schema(
  { patientId: String, conversation: [messageSchema] },
  { timestamps: true, strict: false }
);
const Chat = mongoose.models.Chat || mongoose.model("Chat", chatSchema);

async function connectDB() {
  if (!MONGO_URI) return;
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
  }
}

function toObjectId(id) {
  if (mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === String(id)) {
    return new mongoose.Types.ObjectId(id);
  }
  return id;
}

async function getPatientSummaryFromGemini(patientData) {
  if (!GEMINI_API_KEY) {
    return "Summary unavailable: GEMINI_API_KEY not set.";
  }
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `You are a medical assistant. The following is real patient data fetched from the database (profile, vitals, chat). Analyse it and produce a short, clear health summary. Focus on vitals trends, any concerns, and a brief overall assessment. Use only the data provided; do not invent anything.

Patient data from database:
${JSON.stringify(patientData, null, 2)}

Respond with only the summary text, no extra headings or labels.`;
  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text() || "No summary generated.";
}

app.get("/register", (req, res) => {
  res.json({ message: "Register endpoint", ok: true });
});

// Flow: 1) Get patientId from request body → 2) Fetch that patient's data from MongoDB → 3) Send data to Gemini → 4) Return summary to caller
app.post("/api/patient-summary", async (req, res) => {
  try {
    const { patientId } = req.body;
    if (!patientId) {
      return res.status(400).json({ error: "patientId is required in request body" });
    }

    if (!MONGO_URI || !mongoose.connection.readyState) {
      await connectDB();
    }
    
    const oid = toObjectId(patientId);
    const patientIdStr = String(patientId);

    // 1. Fetch all data for this patient from MongoDB
    const userPromise = oid instanceof mongoose.Types.ObjectId
      ? User.findById(oid).select("-password").lean()
      : Promise.resolve(null);
    const [user, vitals, chat] = await Promise.all([
      userPromise,
      Vitals.find({ patientId: { $in: [oid, patientIdStr] } }).sort({ timestamp: -1 }).lean(),
      Chat.findOne({ patientId: patientIdStr }).lean()
    ]);

    const patientData = {
      patientId: patientIdStr,
      profile: user || null,
      vitals: vitals || [],
      chat: chat || null
    };

    // 2. Send patient data to Gemini to generate summary
    const summary = await getPatientSummaryFromGemini(patientData);

    // 3. Return summary back to the frontend/caller
    return res.json({ summary });
  } catch (err) {
    console.error("POST /api/patient-summary error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
});

const PORT = process.env.PORT || 5002;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Summary server running on port ${PORT}`);
  });
});
