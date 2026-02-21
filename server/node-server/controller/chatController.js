import axios from "axios";
import Chat from "../schema/chatSchema.js";

export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    const patientId = req.user._id; 
    if (!patientId || !message) {
      return res.status(400).json({
        success: false,
        message: "patientId and message are required"
      });
    }


    let chat = await Chat.findOne({ patientId });

    if (!chat) {
      chat = new Chat({
        patientId,
        conversation: []
      });
    }

    chat.conversation.push({
      role: "user",
      content: message
    });

    const aiResponse = await axios.post(
      "https://sibyllic-ralph-electrodynamic.ngrok-free.dev/chat",
      {
        user_id: patientId,
        message: message
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );


    const aiMessage =
      aiResponse.data.response ||
      aiResponse.data.reply ||
      aiResponse.data.message ||
      "No response from AI";

    chat.conversation.push({
      role: "assistant",
      content: aiMessage
    });

    await chat.save();

    res.status(200).json({
      success: true,
      reply: aiMessage
    });

  } catch (error) {
  console.error("Error in chatWithAI:", error.message);

  if (error.response) {
    const status = error.response.status;

    if (status >= 500) {
      return res.status(503).json({
        success: false,
        message: "Service unavailable. Please try again later."
      });
    }


    return res.status(status).json({
      success: false,
      message: error.response.data?.message || "AI service error"
    });
  }


  return res.status(503).json({
    success: false,
    message: "Service unavailable. Unable to connect to AI service."
  });
}
};