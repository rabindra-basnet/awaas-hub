import { Schema, model, models, type Types } from "mongoose";

export interface IFile {
  userId: Types.ObjectId;
  propertyId?: Types.ObjectId | null;
  filename: string;
  storedName: string;
  mimetype: string;
  size: number;
  isPrivate: boolean;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const FileSchema = new Schema<IFile>(
  {
    userId:     { type: Schema.Types.ObjectId, ref: "user", required: true, index: true },
    propertyId: { type: Schema.Types.ObjectId, ref: "Property", default: null, index: true },
    filename:   { type: String, required: true },
    storedName: { type: String, required: true, unique: true },
    mimetype:   { type: String, required: true },
    size:       { type: Number, required: true },
    isPrivate:  { type: Boolean, default: true },
    isDeleted:  { type: Boolean, default: false },
    deletedAt:  { type: Date, default: null },
  },
  { timestamps: true },
);

export const File = models.File || model<IFile>("File", FileSchema);
