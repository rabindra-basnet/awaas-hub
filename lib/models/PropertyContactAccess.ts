// lib/models/PropertyContactAccess.ts
import { Schema, model, models, Types } from "mongoose";

const PropertyContactAccessSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      index: true,
    },
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: "Subscription",
      required: true,
    },
    creditsDeducted: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true },
);

PropertyContactAccessSchema.index(
  { userId: 1, propertyId: 1 },
  { unique: true },
);

export const PropertyContactAccess =
  models.PropertyContactAccess ||
  model("PropertyContactAccess", PropertyContactAccessSchema);
