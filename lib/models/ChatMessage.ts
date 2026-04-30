import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema(
  {
    propertyId: String,
    senderId: String,
    role: String,
    message: String,
  },
  { timestamps: true },
);

export default mongoose.models.ChatMessage ||
  mongoose.model("ChatMessage", ChatSchema);
