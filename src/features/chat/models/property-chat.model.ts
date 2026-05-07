import { Schema, model, models, type Types } from "mongoose";

export interface IPropertyChatConversation {
  buyerId: string;
  buyerName: string;
  sellerId: string;
  propertyId: string;
  propertyTitle: string;
  lastMessage: string;
  lastMessageAt: Date | null;
  unreadBySeller: number;
  unreadByBuyer: number;
  createdAt: Date;
  updatedAt: Date;
}

const PropertyChatConversationSchema = new Schema<IPropertyChatConversation>(
  {
    buyerId:        { type: String, required: true, index: true },
    buyerName:      { type: String, default: "" },
    sellerId:       { type: String, required: true, index: true },
    propertyId:     { type: String, required: true, index: true },
    propertyTitle:  { type: String, default: "" },
    lastMessage:    { type: String, default: "" },
    lastMessageAt:  { type: Date, default: null },
    unreadBySeller: { type: Number, default: 0 },
    unreadByBuyer:  { type: Number, default: 0 },
  },
  { timestamps: true },
);

PropertyChatConversationSchema.index({ buyerId: 1, propertyId: 1 }, { unique: true });

export const PropertyChatConversation =
  models.PropertyChatConversation ||
  model<IPropertyChatConversation>("PropertyChatConversation", PropertyChatConversationSchema);

export interface IPropertyChatMessage {
  conversationId: Types.ObjectId;
  senderId: string;
  senderName: string;
  senderRole: "inquirer" | "owner";
  content: string;
  readBy: string[];
  createdAt: Date;
  updatedAt: Date;
}

const PropertyChatMessageSchema = new Schema<IPropertyChatMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: "PropertyChatConversation", required: true },
    senderId:   { type: String, required: true },
    senderName: { type: String, default: "" },
    senderRole: { type: String, enum: ["inquirer", "owner"], required: true },
    content:    { type: String, required: true, maxlength: 2000 },
    readBy:     { type: [String], default: [] },
  },
  { timestamps: true },
);

PropertyChatMessageSchema.index({ conversationId: 1, createdAt: 1 });

export const PropertyChatMessage =
  models.PropertyChatMessage ||
  model<IPropertyChatMessage>("PropertyChatMessage", PropertyChatMessageSchema);
