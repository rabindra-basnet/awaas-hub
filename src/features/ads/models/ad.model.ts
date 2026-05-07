import { Schema, model, models } from "mongoose";

export type AdSlot = "properties-top" | "properties-inline" | "interstitial" | "dashboard-top";

export interface IAd {
  title: string;
  slot: AdSlot;
  imageUrl: string;
  imageKey: string;
  htmlContent: string;
  targetUrl: string;
  altText: string;
  isActive: boolean;
  startDate: Date | null;
  endDate: Date | null;
  impressions: number;
  clicks: number;
  createdAt: Date;
  updatedAt: Date;
}

const AdSchema = new Schema<IAd>(
  {
    title:       { type: String, required: true },
    slot:        { type: String, required: true, index: true },
    imageUrl:    { type: String, default: "" },
    imageKey:    { type: String, default: "" },
    htmlContent: { type: String, default: "" },
    targetUrl:   { type: String, required: true },
    altText:     { type: String, default: "" },
    isActive:    { type: Boolean, default: true },
    startDate:   { type: Date, default: null },
    endDate:     { type: Date, default: null },
    impressions: { type: Number, default: 0 },
    clicks:      { type: Number, default: 0 },
  },
  { timestamps: true },
);

AdSchema.index({ slot: 1, isActive: 1, startDate: 1, endDate: 1 });

export const Ad = models.Ad || model<IAd>("Ad", AdSchema);
