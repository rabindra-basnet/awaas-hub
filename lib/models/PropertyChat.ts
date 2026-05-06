import { Schema, model, models, Types } from "mongoose";

export interface IPropertyChatMessage {
  _id: Types.ObjectId;
  conversationId: Types.ObjectId;
  senderId: string;
  senderName: string;
  senderRole: "buyer" | "seller";
  content: string;
  readBy: string[];
  createdAt: Date;
}

export interface IPropertyChatConversation {
  _id: Types.ObjectId;
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

const PropertyChatMessageSchema = new Schema<IPropertyChatMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "PropertyChatConversation",
      required: true,
      index: true,
    },
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    senderRole: { type: String, enum: ["buyer", "seller"], required: true },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    readBy: { type: [String], default: [] },
  },
  { timestamps: true },
);

PropertyChatMessageSchema.index({ conversationId: 1, createdAt: 1 });

const PropertyChatConversationSchema = new Schema<IPropertyChatConversation>(
  {
    buyerId: { type: String, required: true, index: true },
    buyerName: { type: String, required: true },
    sellerId: { type: String, required: true, index: true },
    propertyId: { type: String, required: true, index: true },
    propertyTitle: { type: String, default: "" },
    lastMessage: { type: String, default: "" },
    lastMessageAt: { type: Date, default: null },
    unreadBySeller: { type: Number, default: 0 },
    unreadByBuyer: { type: Number, default: 0 },
  },
  { timestamps: true },
);

PropertyChatConversationSchema.index({ buyerId: 1, propertyId: 1 }, { unique: true });

export const PropertyChatMessage =
  models.PropertyChatMessage ||
  model<IPropertyChatMessage>("PropertyChatMessage", PropertyChatMessageSchema);

export const PropertyChatConversation =
  models.PropertyChatConversation ||
  model<IPropertyChatConversation>(
    "PropertyChatConversation",
    PropertyChatConversationSchema,
  );
