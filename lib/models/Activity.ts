import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IActivity {
    _id: string;
    appointmentId: string | Types.ObjectId;
    action: string;
    status: "scheduled" | "approved" | "completed" | "cancelled";
    note?: string;
    createdAt: Date;
}

export interface IActivityDocument extends Omit<IActivity, "_id">, Document { }

const ActivitySchema: Schema<IActivityDocument> = new Schema(
    {
        appointmentId: {
            type: Schema.Types.ObjectId,
            ref: "Appointment",
            required: true,
            index: true
        },
        action: { type: String, required: true },
        status: {
            type: String,
            enum: ["scheduled", "approved", "completed", "cancelled"],
            required: true
        },
        note: { type: String },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

export const Activity: Model<IActivityDocument> =
    mongoose.models.Activity || mongoose.model<IActivityDocument>("Activity", ActivitySchema);

export type CreateActivityInput = Omit<IActivity, "_id" | "createdAt">;