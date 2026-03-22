// lib/models/Conversation.ts
import { Schema, model, models, Types } from "mongoose";

export interface IMessage {
  _id: Types.ObjectId;
  conversationId: Types.ObjectId;
  senderId: string;
  senderName: string;
  senderRole: "buyer" | "seller" | "admin";
  content: string;
  readBy: string[]; // array of userIds who have read this message
  createdAt: Date;
}

export interface IConversation {
  _id: Types.ObjectId;
  propertyId: Types.ObjectId;
  propertyTitle?: string;
  buyerId: string;
  sellerId: string;
  lastMessage?: string;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ── Message Schema ────────────────────────────────────────────────────────────
const MessageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    senderId: { type: String, required: true },
    senderName: { type: String, required: true, default: "User" },
    senderRole: {
      type: String,
      enum: ["buyer", "seller", "admin"],
      required: true,
    },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    readBy: { type: [String], default: [] },
  },
  { timestamps: true },
);

MessageSchema.index({ conversationId: 1, createdAt: 1 });

// ── Conversation Schema ───────────────────────────────────────────────────────
const ConversationSchema = new Schema<IConversation>(
  {
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      index: true,
    },
    propertyTitle: { type: String, default: "" },
    buyerId: { type: String, required: true, index: true },
    sellerId: { type: String, required: true, index: true },
    lastMessage: { type: String, default: "" },
    lastMessageAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// Ensure one conversation per buyer+property
ConversationSchema.index({ propertyId: 1, buyerId: 1 }, { unique: true });

export const Message =
  models.Message || model<IMessage>("Message", MessageSchema);

export const Conversation =
  models.Conversation ||
  model<IConversation>("Conversation", ConversationSchema);
