import { Schema, model, models, type Types } from "mongoose";

export interface IConversation {
  propertyId: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  propertyTitle: string;
  lastMessage: string;
  lastMessageAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    propertyId:    { type: String, required: true, index: true },
    buyerId:       { type: String, required: true, index: true },
    buyerName:     { type: String, default: "" },
    sellerId:      { type: String, required: true, index: true },
    sellerName:    { type: String, default: "" },
    propertyTitle: { type: String, default: "" },
    lastMessage:   { type: String, default: "" },
    lastMessageAt: { type: Date, default: null },
  },
  { timestamps: true },
);

ConversationSchema.index({ propertyId: 1, buyerId: 1 }, { unique: true });

export const Conversation =
  models.Conversation ||
  model<IConversation>("Conversation", ConversationSchema);

export interface IMessage {
  conversationId: Types.ObjectId;
  senderId: string;
  senderName: string;
  content: string;
  readBy: string[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
    senderId:   { type: String, required: true },
    senderName: { type: String, default: "" },
    content:    { type: String, required: true, maxlength: 2000 },
    readBy:     { type: [String], default: [] },
  },
  { timestamps: true },
);

MessageSchema.index({ conversationId: 1, createdAt: 1 });

export const Message =
  models.Message ||
  model<IMessage>("Message", MessageSchema);
