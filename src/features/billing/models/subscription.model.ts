import { Schema, model, models, type Types } from "mongoose";

export interface ISubscription {
  userId: Types.ObjectId;
  propertyId: Types.ObjectId | null;
  credits: number;
  creditsToAdd: number;
  creditsGranted: boolean;
  usedCredits: number;
  amount: number;
  status: "pending" | "paid" | "failed" | "expired";
  transactionId: string;
  transactionUuid: string;
  paymentMethod: "esewa" | "khalti";
  paymentDate: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    userId:         { type: Schema.Types.ObjectId, ref: "user", required: true },
    propertyId:     { type: Schema.Types.ObjectId, ref: "Property", required: false, default: null },
    credits:        { type: Number, default: 0 },
    creditsToAdd:   { type: Number, required: true },
    creditsGranted: { type: Boolean, default: false },
    usedCredits:    { type: Number, default: 0 },
    amount:         { type: Number, required: true, min: 0 },
    status:         { type: String, enum: ["pending", "paid", "failed", "expired"], default: "pending" },
    transactionId:  { type: String, required: true },
    transactionUuid: { type: String, default: "" },
    paymentMethod:  { type: String, enum: ["esewa", "khalti"], default: "esewa" },
    paymentDate:    { type: Date, default: null },
    expiresAt:      { type: Date, default: null },
  },
  { timestamps: true },
);

SubscriptionSchema.index({ userId: 1, propertyId: 1 });
SubscriptionSchema.index({ transactionId: 1 }, { unique: true });
SubscriptionSchema.index({ userId: 1, status: 1 });

export const Subscription =
  models.Subscription ||
  model<ISubscription>("Subscription", SubscriptionSchema);
