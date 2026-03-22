// lib/models/Ads.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export type AdSlot =
  | "properties-top"
  | "properties-inline"
  | "interstitial"
  | string;

export interface IAd extends Document {
  title: string;
  slot: AdSlot;
  imageUrl?: string;
  imageKey?: string; // R2 object key — set when image is uploaded, not pasted
  htmlContent?: string;
  targetUrl: string;
  altText?: string;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  impressions: number;
  clicks: number;
  createdAt: Date;
  updatedAt: Date;
}

const AdSchema = new Schema<IAd>(
  {
    title: { type: String, required: true, trim: true },
    slot: { type: String, required: true, index: true, trim: true },
    imageUrl: { type: String, trim: true },
    imageKey: { type: String, trim: true, default: null }, // ← R2 key
    htmlContent: { type: String },
    targetUrl: { type: String, required: true, trim: true },
    altText: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
  },
  { timestamps: true },
);

AdSchema.index({ slot: 1, isActive: 1, startDate: 1, endDate: 1 });

// Fix: use "Ads" as the model name to match mongoose.models.Ads
const Ads: Model<IAd> =
  mongoose.models.Ads ?? mongoose.model<IAd>("Ads", AdSchema);

export default Ads;
