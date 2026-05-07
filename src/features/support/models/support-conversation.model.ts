import { Schema, model, models, type Types } from "mongoose";

export interface ISupportConversation {
  userId: string;
  userName: string;
  propertyId: string;
  propertyTitle: string;
  lastMessage: string;
  lastMessageAt: Date | null;
  status: "open" | "closed";
  unreadByAdmin: number;
  unreadByUser: number;
  createdAt: Date;
  updatedAt: Date;
}

const SupportConversationSchema = new Schema<ISupportConversation>(
  {
    userId:        { type: String, required: true, index: true },
    userName:      { type: String, default: "" },
    propertyId:    { type: String, default: "" },
    propertyTitle: { type: String, default: "" },
    lastMessage:   { type: String, default: "" },
    lastMessageAt: { type: Date, default: null },
    status:        { type: String, enum: ["open", "closed"], default: "open" },
    unreadByAdmin: { type: Number, default: 0 },
    unreadByUser:  { type: Number, default: 0 },
  },
  { timestamps: true },
);

SupportConversationSchema.index({ userId: 1, propertyId: 1 }, { unique: true });

export const SupportConversation =
  models.SupportConversation ||
  model<ISupportConversation>("SupportConversation", SupportConversationSchema);

export interface ISupportMessage {
  conversationId: Types.ObjectId;
  senderId: string;
  senderName: string;
  senderRole: "user" | "admin";
  content: string;
  readBy: string[];
  createdAt: Date;
  updatedAt: Date;
}

const SupportMessageSchema = new Schema<ISupportMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: "SupportConversation", required: true },
    senderId:   { type: String, required: true },
    senderName: { type: String, default: "" },
    senderRole: { type: String, enum: ["user", "admin"], required: true },
    content:    { type: String, required: true, maxlength: 2000 },
    readBy:     { type: [String], default: [] },
  },
  { timestamps: true },
);

SupportMessageSchema.index({ conversationId: 1, createdAt: 1 });

export const SupportMessage =
  models.SupportMessage ||
  model<ISupportMessage>("SupportMessage", SupportMessageSchema);
