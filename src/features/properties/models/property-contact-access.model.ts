import { Schema, model, models, type Types } from "mongoose";

export interface IPropertyContactAccess {
  userId: Types.ObjectId;
  propertyId: Types.ObjectId;
  subscriptionId: Types.ObjectId;
  creditsDeducted: number;
  createdAt: Date;
  updatedAt: Date;
}

const PropertyContactAccessSchema = new Schema<IPropertyContactAccess>(
  {
    userId:         { type: Schema.Types.ObjectId, ref: "user", required: true, index: true },
    propertyId:     { type: Schema.Types.ObjectId, ref: "Property", required: true, index: true },
    subscriptionId: { type: Schema.Types.ObjectId, ref: "Subscription", required: true },
    creditsDeducted: { type: Number, default: 1 },
  },
  { timestamps: true },
);

PropertyContactAccessSchema.index({ userId: 1, propertyId: 1 }, { unique: true });

export const PropertyContactAccess =
  models.PropertyContactAccess ||
  model<IPropertyContactAccess>("PropertyContactAccess", PropertyContactAccessSchema);
