import { Schema, model, models, Types } from "mongoose";

export const PROPERTY_STATUS = ["available", "booked", "sold"] as const;
export const PROPERTY_CATEGORY = [
  "House",
  "Apartment",
  "Land",
  "Colony",
] as const;
export const PROPERTY_FACE = [
  "North",
  "South",
  "East",
  "West",
  "North-East",
  "North-West",
  "South-East",
  "South-West",
] as const;
export const PROPERTY_ROAD_TYPE = [
  "Blacktopped",
  "Graveled",
  "Dirt",
  "Goreto",
] as const;
export const PROPERTY_LOCATION = [
  "Kathmandu",
  "Lalitpur",
  "Bhaktapur",
] as const;

export type PropertyStatus = (typeof PROPERTY_STATUS)[number];
export type PropertyCategory = (typeof PROPERTY_CATEGORY)[number];
export type PropertyFace = (typeof PROPERTY_FACE)[number];
export type PropertyRoadType = (typeof PROPERTY_ROAD_TYPE)[number];
export type PropertyLocation = (typeof PROPERTY_LOCATION)[number];

export interface IProperty {
  // Core
  title: string;
  price: number;
  location: string;
  status: "available" | "booked" | "sold";
  verificationStatus: "pending" | "verified" | "rejected";
  verifiedAt: Date;
  verifiedBy: Types.ObjectId;
  verified: boolean;
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

  // GPS pin coordinates
  latitude?: number;
  longitude?: number;

  /**
   * Boundary polygon drawn by seller on the Leaflet map picker.
   * Stored as an array of [lat, lng] pairs.
   * Min 3 points needed to form a closed polygon.
   * Rendered as a dashed polygon overlay on the premium map.
   */
  boundaryPoints?: [number, number][];

  // Nearby facilities
  nearHospital?: string;
  nearAirport?: string;
  nearSupermarket?: string;
  nearSchool?: string;
  nearGym?: string;
  nearTransport?: string;
  nearAtm?: string;
  nearRestaurant?: string;

  // Video tour
  videoUrl?: string;
}

// ── Reusable coordinate pair sub-schema ──────────────────────────────
const CoordPairSchema = new Schema<{ 0: number; 1: number }>(
  {
    0: { type: Number, required: true },
    1: { type: Number, required: true },
  },
  { _id: false },
);

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
  verificationStatus: {
    type: String,
    enum: ["pending", "verified", "rejected"],
    default: "pending",
  },
  verifiedAt: { type: Date, default: null },
  verifiedBy: {
    type: Types.ObjectId,
    ref: "User",
    default: null,
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
      message: "Max 10 images",
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

  // ── GPS pin ───────────────────────────────────────────────────────────────
  latitude: {
    type: Number,
    default: null,
    validate: {
      validator: (v: number | null) => v === null || (v >= -90 && v <= 90),
      message: "Latitude must be between -90 and 90",
    },
  },
  longitude: {
    type: Number,
    default: null,
    validate: {
      validator: (v: number | null) => v === null || (v >= -180 && v <= 180),
      message: "Longitude must be between -180 and 180",
    },
  },

  // ── Boundary polygon ──────────────────────────────────────────────────────
  // Array of [lat, lng] pairs drawn by the seller on the map picker.
  // Validated: if present, must have at least 3 points.
  boundaryPoints: {
    type: [[Number]],
    default: [],
    validate: {
      validator: (arr: number[][]) =>
        arr.length === 0 ||
        (arr.length >= 3 && arr.every((p) => p.length === 2)),
      message:
        "Boundary requires at least 3 coordinate pairs, each as [lat, lng]",
    },
  },

  // ── Nearby facilities ─────────────────────────────────────────────────────
  nearHospital: { type: String, trim: true, default: "" },
  nearAirport: { type: String, trim: true, default: "" },
  nearSupermarket: { type: String, trim: true, default: "" },
  nearSchool: { type: String, trim: true, default: "" },
  nearGym: { type: String, trim: true, default: "" },
  nearTransport: { type: String, trim: true, default: "" },
  nearAtm: { type: String, trim: true, default: "" },
  nearRestaurant: { type: String, trim: true, default: "" },

  videoUrl: { type: String, trim: true, default: "" },
});

PropertySchema.index({ sellerId: 1, status: 1 });
PropertySchema.index({ sellerId: 1, createdAt: -1 });
PropertySchema.index({ category: 1, status: 1 });
PropertySchema.index({ location: 1, status: 1 });
PropertySchema.index({ latitude: 1, longitude: 1 }, { sparse: true });

export const Property =
  models.Property || model<IProperty>("Property", PropertySchema);
