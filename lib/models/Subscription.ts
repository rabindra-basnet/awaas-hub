import { Schema, model, models, Types } from "mongoose";

export type SubscriptionStatus = "pending" | "paid" | "failed" | "expired";

export interface ISubscription {
  userId: Types.ObjectId;
  propertyId: Types.ObjectId;
  credits: number;
  creditsToAdd: number;
  creditsGranted: boolean;
  usedCredits: number;
  amount: number;
  status: SubscriptionStatus;
  transactionId: string;
  transactionUuid?: string;
  paymentMethod: "esewa";
  paymentDate?: Date;
  expiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    credits: {
      type: Number,
      default: 0,
    },
    usedCredits: {
      type: Number,
      default: 0,
    },
    creditsToAdd: {
      type: Number,
      required: true,
    },
    creditsGranted: {
      type: Boolean,
      default: false,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "expired"],
      default: "pending",
    },
    transactionId: {
      type: String,
      required: true,
      // unique: true,
    },
    transactionUuid: {
      type: String,
    },
    paymentMethod: {
      type: String,
      enum: ["esewa"],
      default: "esewa",
    },
    paymentDate: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

subscriptionSchema.index({ userId: 1, propertyId: 1 });
subscriptionSchema.index({ transactionId: 1 }, { unique: true });

export const Subscription =
  models.Subscription ||
  model<ISubscription>("Subscription", subscriptionSchema);
