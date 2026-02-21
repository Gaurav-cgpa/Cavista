import mongoose from "mongoose";

const telegramSessionSchema = new mongoose.Schema(
  {
    chatId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    username: String,
    firstName: String,
    lastName: String,
    messageCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const TelegramSession = mongoose.model("TelegramSession", telegramSessionSchema);
