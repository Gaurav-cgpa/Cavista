import Chat from "../schema/chatSchema.js";


export const saveChatMessage = async (req, res) => {
  try {
    const { patientId, role, content } = req.body;

    let chat = await Chat.findOne({ patientId });

    if (!chat) {
      chat = new Chat({
        patientId,
        conversation: [{ role, content }]
      });
    } else {
      chat.conversation.push({ role, content });
    }

    await chat.save();

    res.status(200).json({
      message: "Chat saved successfully",
      chat
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};