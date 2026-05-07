import { Schema, model, models, type Types } from "mongoose";

export interface IActivityEntry {
  status: "scheduled" | "approved" | "completed" | "cancelled";
  note: string;
  changedAt: Date;
}

export interface IAppointment {
  title: string;
  type: "Property Viewing" | "Inspection" | "Legal Review";
  date: Date;
  propertyId: Types.ObjectId | null;
  participants: Types.ObjectId[];
  createdBy: Types.ObjectId;
  image: string | null;
  activityHistory: IActivityEntry[];
  createdAt: Date;
}

const ActivityEntrySchema = new Schema<IActivityEntry>(
  {
    status:    { type: String, enum: ["scheduled", "approved", "completed", "cancelled"], required: true },
    note:      { type: String, maxlength: 500, default: "" },
    changedAt: { type: Date, default: () => new Date() },
  },
  { _id: false },
);

const AppointmentSchema = new Schema<IAppointment>(
  {
    title:      { type: String, required: true, maxlength: 200 },
    type:       { type: String, enum: ["Property Viewing", "Inspection", "Legal Review"], required: true },
    date:       { type: Date, required: true },
    propertyId: { type: Schema.Types.ObjectId, ref: "Property", default: null },
    participants: [{ type: Schema.Types.ObjectId, ref: "user" }],
    createdBy:  { type: Schema.Types.ObjectId, ref: "user", required: true },
    image:      { type: String, default: null },
    activityHistory: { type: [ActivityEntrySchema], default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

AppointmentSchema.index({ createdBy: 1, createdAt: -1 });
AppointmentSchema.index({ participants: 1 });
AppointmentSchema.index({ propertyId: 1 });

export const Appointment =
  models.Appointment ||
  model<IAppointment>("Appointment", AppointmentSchema);
