import { Schema, model, models, Types } from "mongoose";

export interface IProperty {
  // Core
  title: string;
  price: number;
  location: string;
  status: "available" | "booked" | "sold";
  description?: string;
  isFavorite: boolean;
  sellerId: Types.ObjectId;
  createdAt: Date;
  images: string[];

  // Analytics
  views: number;
  messagesCount: number;

  // Property details
  category: "House" | "Apartment" | "Land" | "Colony";
  area?: string;
  bedrooms?: number;
  bathrooms?: number;
  face?:
    | "North"
    | "South"
    | "East"
    | "West"
    | "North-East"
    | "North-West"
    | "South-East"
    | "South-West";
  roadType?: "Blacktopped" | "Graveled" | "Dirt" | "Goreto";
  roadAccess?: string;
  negotiable?: boolean;

  // Location details
  municipality?: string;
  wardNo?: string;
  ringRoad?: string;

  // Nearby facilities
  nearHospital?: string;
  nearAirport?: string;
  nearSupermarket?: string;
  nearSchool?: string;
  nearGym?: string;
  nearTransport?: string;
  nearAtm?: string;
  nearRestaurant?: string;
}

const PropertySchema = new Schema<IProperty>({
  // ── Core ──────────────────────────────────────────────────────────────────
  title: { type: String, required: true, trim: true, maxlength: 200 },
  price: { type: Number, required: true, min: 0 },
  location: { type: String, required: true, trim: true, maxlength: 100 },
  status: {
    type: String,
    enum: ["available", "booked", "sold"],
    default: "available",
  },
  description: { type: String, trim: true, maxlength: 2000, default: "" },
  isFavorite: { type: Boolean, default: false },
  sellerId: {
    type: Schema.Types.ObjectId,
    ref: "users",
    required: true,
    index: true,
  },
  createdAt: { type: Date, default: Date.now },
  images: {
    type: [String],
    default: [],
    validate: {
      validator: (arr: string[]) => arr.length <= 10,
      message: "You can upload up to 10 images only",
    },
  },

  // ── Analytics ─────────────────────────────────────────────────────────────
  views: { type: Number, default: 0, min: 0 },
  messagesCount: { type: Number, default: 0, min: 0 },

  // ── Property details ──────────────────────────────────────────────────────
  category: {
    type: String,
    enum: ["House", "Apartment", "Land", "Colony"],
    required: true,
  },
  area: { type: String, trim: true, default: "" },
  bedrooms: { type: Number, default: 0, min: 0, max: 20 },
  bathrooms: { type: Number, default: 0, min: 0, max: 20 },
  face: {
    type: String,
    enum: [
      "North",
      "South",
      "East",
      "West",
      "North-East",
      "North-West",
      "South-East",
      "South-West",
    ],
    default: null,
  },
  roadType: {
    type: String,
    enum: ["Blacktopped", "Graveled", "Dirt", "Goreto"],
    default: null,
  },
  roadAccess: { type: String, trim: true, default: "" },
  negotiable: { type: Boolean, default: false },

  // ── Location details ──────────────────────────────────────────────────────
  municipality: { type: String, trim: true, default: "" },
  wardNo: { type: String, trim: true, default: "" },
  ringRoad: { type: String, trim: true, default: "" },

  // ── Nearby facilities ─────────────────────────────────────────────────────
  nearHospital: { type: String, trim: true, default: "" },
  nearAirport: { type: String, trim: true, default: "" },
  nearSupermarket: { type: String, trim: true, default: "" },
  nearSchool: { type: String, trim: true, default: "" },
  nearGym: { type: String, trim: true, default: "" },
  nearTransport: { type: String, trim: true, default: "" },
  nearAtm: { type: String, trim: true, default: "" },
  nearRestaurant: { type: String, trim: true, default: "" },
});

// ── Indexes ───────────────────────────────────────────────────────────────────
PropertySchema.index({ sellerId: 1, status: 1 });
PropertySchema.index({ sellerId: 1, createdAt: -1 });
PropertySchema.index({ category: 1, status: 1 });
PropertySchema.index({ location: 1, status: 1 });

export const Property =
  models.Property || model<IProperty>("Property", PropertySchema);
