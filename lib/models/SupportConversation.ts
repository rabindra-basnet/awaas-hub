import { Schema, model, models, Types } from "mongoose";

export interface ISupportMessage {
  _id: Types.ObjectId;
  conversationId: Types.ObjectId;
  senderId: string;
  senderName: string;
  senderRole: "buyer" | "seller" | "admin";
  content: string;
  readBy: string[];
  createdAt: Date;
}

export interface ISupportConversation {
  _id: Types.ObjectId;
  userId: string;
  userName: string;
  userRole: "buyer" | "seller";
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

const SupportMessageSchema = new Schema<ISupportMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "SupportConversation",
      required: true,
      index: true,
    },
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
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

SupportMessageSchema.index({ conversationId: 1, createdAt: 1 });

const SupportConversationSchema = new Schema<ISupportConversation>(
  {
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    userRole: { type: String, enum: ["buyer", "seller"], required: true },
    propertyId: { type: String, default: "", index: true },
    propertyTitle: { type: String, default: "" },
    lastMessage: { type: String, default: "" },
    lastMessageAt: { type: Date, default: null },
    status: { type: String, enum: ["open", "closed"], default: "open" },
    unreadByAdmin: { type: Number, default: 0 },
    unreadByUser: { type: Number, default: 0 },
  },
  { timestamps: true },
);

SupportConversationSchema.index({ userId: 1, propertyId: 1 }, { unique: true });

export const SupportMessage =
  models.SupportMessage ||
  model<ISupportMessage>("SupportMessage", SupportMessageSchema);

export const SupportConversation =
  models.SupportConversation ||
  model<ISupportConversation>("SupportConversation", SupportConversationSchema);
