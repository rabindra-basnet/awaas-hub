import { Schema, model, models, type Types } from "mongoose";

export interface ICreditLedger {
  userId: Types.ObjectId;
  propertyId: Types.ObjectId;
  subscriptionId: Types.ObjectId;
  delta: number;
  reason: "purchase" | "consume" | "refund" | "expire";
  createdAt: Date;
}

const CreditLedgerSchema = new Schema<ICreditLedger>(
  {
    userId:         { type: Schema.Types.ObjectId, ref: "user", required: true, index: true },
    propertyId:     { type: Schema.Types.ObjectId, ref: "Property", required: true },
    subscriptionId: { type: Schema.Types.ObjectId, ref: "Subscription", required: true },
    delta:          { type: Number, required: true },
    reason:         { type: String, enum: ["purchase", "consume", "refund", "expire"], required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

CreditLedgerSchema.index({ userId: 1, createdAt: -1 });

export const CreditLedger =
  models.CreditLedger ||
  model<ICreditLedger>("CreditLedger", CreditLedgerSchema);
