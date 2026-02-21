import "dotenv/config";
import express from "express";
import cors from "cors";
import Groq from "groq-sdk";

const app = express();
app.use(cors());
app.use(express.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";

if (!GROQ_API_KEY) {
  console.warn("GROQ_API_KEY not set.");
}

const groq = new Groq({
  apiKey: GROQ_API_KEY,
});

//
// 🔥 GROQ SUMMARY FUNCTION
//
async function getPatientSummaryFromGroq(patientData) {
  try {
    const prompt = `
You are a professional medical assistant.

Analyse the patient profile and last-day vitals data.
Provide:
- Overall health summary
- Risk indicators
- Observed trends
- Important concerns

Use only the provided data.

Patient Data:
${JSON.stringify(patientData, null, 2)}
`;

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You are a clinical medical assistant.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
    });

    return (
      response.choices[0]?.message?.content ||
      "No summary generated."
    );
  } catch (error) {
    console.error("Groq Error:", error);
    return "AI generation failed.";
  }
}

//
// 🔥 SUMMARY ROUTE
//
app.post("/api/patient-summary", async (req, res) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authorization token required",
      });
    }

    // 1️⃣ Fetch user profile
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

    const profileData = await profileResponse.json();

    if (!profileData.success) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = profileData.data;
    const patientId = user._id;

    console.log("Fetched profile:", user);

    // 2️⃣ Fetch last-day realtime vitals
    const realtimeResponse = await fetch(
      `http://localhost:5000/api/realtime/last-day/${patientId}`,
      {
        method: "GET",
        headers: {
          Authorization: token,
        },
      }
    );

    let realtimeData = null;

    if (realtimeResponse.ok) {
      const realtimeJson = await realtimeResponse.json();
      realtimeData = realtimeJson.data || realtimeJson;
    }

    console.log("Fetched realtime data:", realtimeData);

    // 3️⃣ Merge data
    const patientData = {
      profile: user,
      lastDayVitals: realtimeData,
    };

    // 4️⃣ Send to Groq
    const summary = await getPatientSummaryFromGroq(patientData);

    return res.json({
      success: true,
      summary,
    });

  } catch (error) {
    console.error("Summary error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`Summary server running on port ${PORT}`);
});