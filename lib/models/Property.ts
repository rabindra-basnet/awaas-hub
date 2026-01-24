import mongoose, { Schema, model, models, Types } from "mongoose";

export interface IProperty {
  title: string;
  price: number;
  location: string;
  status: "available" | "pending" | "sold";
  description?: string;
  isFavorite: boolean;
  sellerId: Types.ObjectId; // MongoDB ObjectId from user

  createdAt: Date;
  images: string[];
  views: number;
  messagesCount: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
}

const PropertySchema = new Schema<IProperty>({
  title: { type: String, required: true, trim: true, maxlength: 200 },

  price: { type: Number, required: true, min: 0 },

  location: { type: String, required: true, trim: true, maxlength: 100 },
  status: {
    type: String,
    enum: ["available", "pending", "sold"],
    default: "available",
  },

  description: { type: String, trim: true, maxlength: 1000, default: "" },

  isFavorite: { type: Boolean, default: false },

  sellerId: {
    type: Schema.Types.ObjectId,
    ref: "users",
    required: true,
    index: true,
  },

  // 🔥 Dashboard / analytics fields
  views: { type: Number, default: 0, min: 0 },
  messagesCount: { type: Number, default: 0, min: 0 },
  // 🔥 Dashboard / analytics fields
  images: {
    type: [String],
    default: [],
    validate: {
      validator: (arr: string[]) => arr.length <= 10, // limit max 10 images
      message: "You can upload up to 10 images only",
    },
  },
  createdAt: { type: Date, default: Date.now },
  bedrooms: { type: Number, default: 0, min: 0, max: 20 },
  bathrooms: { type: Number, default: 0, min: 0, max: 20 },
  area: { type: Number, default: 0, min: 0 },
});

// Indexes for dashboard and queries
// Indexes for dashboard and queries
PropertySchema.index({ sellerId: 1, status: 1 });
PropertySchema.index({ sellerId: 1, createdAt: -1 });

export const Property =
  models.Property || model<IProperty>("Property", PropertySchema);
