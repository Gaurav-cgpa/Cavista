import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true
    },
    content: {
      type: String,
      required: true
    }
  },
  { _id: false }
);

const chatSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: true
    },
    conversation: [messageSchema], 
  },
  { timestamps: true }
);


const Chat = mongoose.model("Chat", chatSchema);

export default Chat;

