import "dotenv/config";
import express from "express";
import cors from "cors";
import Groq from "groq-sdk";

const app = express();
app.use(cors());
app.use(express.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  console.warn("⚠️ GROQ_API_KEY not set");
}

const groq = new Groq({
  apiKey: GROQ_API_KEY,
});

//
// =====================================
// 🔥 GROQ SUMMARY GENERATOR
// =====================================
async function generateSummary(patientData) {
  try {
    const prompt = `
You are a professional clinical medical assistant.

Analyze the patient profile and 24-hour vitals history.

Provide:
- Overall health summary
- Risk indicators
- Observed trends in heart rate, blood pressure, glucose and sleep
- Any abnormal fluctuations
- Important medical concerns

Use ONLY the provided data.

Patient Data:
${JSON.stringify(patientData, null, 2)}
`;

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You are a clinical medical assistant." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
    });

    return response.choices[0]?.message?.content || "No summary generated.";
  } catch (error) {
    console.error("❌ Groq Error:", error.message);
    return "AI generation failed.";
  }
}

//
// =====================================
// 🔥 SUMMARY ROUTE
// =====================================
app.post("/api/patient-summary", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization header required",
      });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader
      : `Bearer ${authHeader}`;

    //
    // 1️⃣ Fetch Profile
    //
    const profileResponse = await fetch(
      "http://localhost:5000/api/user/profile",
      {
        method: "GET",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      }
    );

    if (!profileResponse.ok) {
      return res.status(400).json({
        success: false,
        message: "Failed to fetch profile",
      });
    }

    const profileJson = await profileResponse.json();

    if (!profileJson.success || !profileJson.data) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = profileJson.data;
    const patientId = user._id;

    console.log("✅ Profile fetched for:", patientId);

    //
    // 2️⃣ Fetch Realtime Vitals
    //
    const realtimeResponse = await fetch(
      `http://localhost:5000/api/realtime/last-day/${patientId}`,
      {
        method: "GET",
        headers: {
          Authorization: token,
        },
      }
    );

    let vitalsList = [];
    let alerts = [];
    let hasEmergency = false;

    if (realtimeResponse.ok) {
      const realtimeJson = await realtimeResponse.json();

      console.log("✅ Realtime response:", realtimeJson);

      if (realtimeJson.success && realtimeJson.record?.history?.length) {

        // 🔥 Extract from record.history
        vitalsList = realtimeJson.record.history.map(entry => ({
          timestamp: entry.timestamp,
          heartRate: entry.data?.heartRate ?? null,
          systolicBP: entry.data?.systolicBP ?? null,
          diastolicBP: entry.data?.diastolicBP ?? null,
          glucose: entry.data?.glucose ?? null,
          sleepHours: entry.data?.sleepHours ?? null,
        }));

        alerts = realtimeJson.alerts || [];
        hasEmergency = realtimeJson.hasEmergency || false;
      }
    }

    //
    // 3️⃣ Prepare Final AI Payload
    //
    const patientData = {
      profile: {
        fullName: user.fullName,
        age: user.age,
        gender: user.gender,
        height: user.height,
        weight: user.weight,
        bloodGroup: user.bloodGroup,
        healthHistory: user.healthHistory || null,
      },
      vitalsLast24Hours: vitalsList,
      totalRecords: vitalsList.length,
      latestReading: vitalsList[vitalsList.length - 1] || null,
      alerts,
      hasEmergency
    };

    console.log("📊 Final AI Payload:", JSON.stringify(patientData, null, 2));

    //
    // 4️⃣ Generate AI Summary
    //
    const summary = await generateSummary(patientData);

    return res.json({
      success: true,
      summary,
    });

  } catch (error) {
    console.error("❌ Summary route error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

//
// =====================================
// 🚀 START SERVER
// =====================================
const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`🚀 Summary server running on port ${PORT}`);
});