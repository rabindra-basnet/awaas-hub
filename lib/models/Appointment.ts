import { Schema, model, models, Types } from "mongoose";

export interface IAppointment {
  title: string;
  type: "Property Viewing" | "Inspection" | "Legal Review";
  date: Date;

  propertyId?: Types.ObjectId; // optional link to property
  participants: Types.ObjectId[]; // buyer + seller
  createdBy: Types.ObjectId; // who created it

  status: "scheduled" | "completed" | "cancelled" | "approved";
  createdAt: Date;

  image?: string; // optional avatar or property image
  notes?: string;
}

const AppointmentSchema = new Schema<IAppointment>({
  title: { type: String, required: true, trim: true, maxlength: 200 },

  type: {
    type: String,
    required: true,
    enum: ["Property Viewing", "Inspection", "Legal Review"],
  },

  date: { type: Date, required: true },

  propertyId: { type: Schema.Types.ObjectId, ref: "Property", default: null },

  participants: [
    { type: Schema.Types.ObjectId, ref: "users", required: true, index: true },
  ],

  createdBy: { type: Schema.Types.ObjectId, ref: "users", required: true },

  status: {
    type: String,
    enum: ["scheduled", "completed", "cancelled", "approved"],
    default: "scheduled",
  },

  createdAt: { type: Date, default: Date.now },

  image: { type: String, default: null },

  notes: { type: String, trim: true, maxlength: 500, default: "" },
});

// Export the model
export const Appointment =
  models.Appointment || model<IAppointment>("Appointment", AppointmentSchema);
