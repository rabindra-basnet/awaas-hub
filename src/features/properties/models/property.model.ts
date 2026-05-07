import { Schema, model, models, type Types } from "mongoose";

export interface IProperty {
  title: string;
  price: number;
  location: string;
  status: "available" | "booked" | "sold";
  verificationStatus: "pending" | "verified" | "rejected";
  verifiedAt?: Date | null;
  verifiedBy?: Types.ObjectId | null;
  description?: string;
  sellerId: Types.ObjectId;
  views: number;
  messagesCount: number;

  category: "House" | "Apartment" | "Land" | "Colony";
  area?: string;
  bedrooms?: number;
  bathrooms?: number;
  face?: string;
  roadType?: string;
  roadAccess?: string;
  negotiable: boolean;

  municipality?: string;
  wardNo?: string;
  ringRoad?: string;

  latitude?: number | null;
  longitude?: number | null;
  boundaryPoints: [number, number][];

  nearHospital?: string;
  nearAirport?: string;
  nearSupermarket?: string;
  nearSchool?: string;
  nearGym?: string;
  nearTransport?: string;
  nearAtm?: string;
  nearRestaurant?: string;

  videoUrl?: string;
  soldAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema = new Schema<IProperty>(
  {
    title:              { type: String, required: true, trim: true, maxlength: 200 },
    price:              { type: Number, required: true, min: 0 },
    location:           { type: String, required: true, trim: true, maxlength: 100 },
    status:             { type: String, enum: ["available", "booked", "sold"], default: "available" },
    verificationStatus: { type: String, enum: ["pending", "verified", "rejected"], default: "pending" },
    verifiedAt:         { type: Date, default: null },
    verifiedBy:         { type: Schema.Types.ObjectId, ref: "user", default: null },
    description:        { type: String, trim: true, maxlength: 2000 },
    sellerId:           { type: Schema.Types.ObjectId, ref: "user", required: true },
    views:              { type: Number, default: 0 },
    messagesCount:      { type: Number, default: 0 },

    category:    { type: String, enum: ["House", "Apartment", "Land", "Colony"], required: true },
    area:        { type: String, trim: true },
    bedrooms:    { type: Number, min: 0, max: 20 },
    bathrooms:   { type: Number, min: 0, max: 20 },
    face:        { type: String, trim: true },
    roadType:    { type: String, trim: true },
    roadAccess:  { type: String, trim: true },
    negotiable:  { type: Boolean, default: false },

    municipality: { type: String, trim: true },
    wardNo:       { type: String, trim: true },
    ringRoad:     { type: String, trim: true },

    latitude:       { type: Number, default: null },
    longitude:      { type: Number, default: null },
    boundaryPoints: { type: [[Number]], default: [] },

    nearHospital:    { type: String, trim: true },
    nearAirport:     { type: String, trim: true },
    nearSupermarket: { type: String, trim: true },
    nearSchool:      { type: String, trim: true },
    nearGym:         { type: String, trim: true },
    nearTransport:   { type: String, trim: true },
    nearAtm:         { type: String, trim: true },
    nearRestaurant:  { type: String, trim: true },

    videoUrl: { type: String, trim: true },
    soldAt:   { type: Date, default: null },
  },
  { timestamps: true },
);

PropertySchema.index({ sellerId: 1, status: 1 });
PropertySchema.index({ sellerId: 1, createdAt: -1 });
PropertySchema.index({ category: 1, status: 1 });
PropertySchema.index({ verificationStatus: 1, status: 1 });
PropertySchema.index({ latitude: 1, longitude: 1 }, { sparse: true });

export const Property = models.Property || model<IProperty>("Property", PropertySchema);
