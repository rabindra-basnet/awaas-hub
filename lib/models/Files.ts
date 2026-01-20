import mongoose, { Schema, Model } from "mongoose";
import {
  IFile,
  IFileDocument,
  IFileMethods,
  IFileModel,
} from "@/types/file.types";

const FileSchema = new Schema<
  IFile,
  Model<IFile, {}, IFileMethods>,
  IFileMethods
>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: [true, "User ID is required"],
      index: true,
    },
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      index: true,
    },
    filename: {
      type: String,
      required: [true, "Filename is required"],
      trim: true,
    },
    storedName: {
      type: String,
      required: [true, "Stored name is required"],
      unique: true,
      index: true,
      trim: true,
    },
    isPrivate: {
      type: Boolean,
      default: true,
      required: true,
      index: true,
    },
    mimetype: {
      type: String,
      required: [true, "MIME type is required"],
      trim: true,
    },
    size: {
      type: Number,
      required: [true, "File size is required"],
      min: [0, "File size cannot be negative"],
    },
    isDeleted: {
      type: Boolean,
      default: false,
      required: true,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    id: false, // ← disables automatic .id virtual
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

/* Compound Indexes */
FileSchema.index({ userId: 1, createdAt: -1 });
FileSchema.index({ propertyId: 1, createdAt: -1 });
FileSchema.index({ isPrivate: 1, isDeleted: 1 });
FileSchema.index({ storedName: 1, isDeleted: 1 });
FileSchema.index({ userId: 1, isDeleted: 1 });

/* Middleware */
FileSchema.pre("save", function (next) {
  if (this.isDeleted && !this.deletedAt) {
    this.deletedAt = new Date();
  }
});

FileSchema.methods.softDelete = async function (
  this: IFileDocument,
): Promise<IFileDocument> {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

FileSchema.methods.restore = async function (
  this: IFileDocument,
): Promise<IFileDocument> {
  this.isDeleted = false;
  this.deletedAt = undefined;
  return this.save();
};

/* Static Methods */
FileSchema.statics.findActiveByUser = function (
  userId: string,
  options?: { propertyId?: string; isPrivate?: boolean },
) {
  const query: any = { userId, isDeleted: false };
  if (options?.propertyId) query.propertyId = options.propertyId;
  if (options?.isPrivate !== undefined) query.isPrivate = options.isPrivate;
  return this.find(query).sort({ createdAt: -1 });
};

FileSchema.statics.findByStoredName = function (storedName: string) {
  return this.findOne({ storedName, isDeleted: false });
};

/* Virtuals */
FileSchema.virtual("url").get(function (this: IFileDocument) {
  return this.isPrivate
    ? `/api/files/private/${this.storedName}`
    : `/api/files/public/${this.storedName}`;
});

FileSchema.virtual("readableSize").get(function (this: IFileDocument) {
  const bytes = this.size;
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
});

FileSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.id; // ← this was missing
    delete ret.__v;
    return ret;
  },
});
FileSchema.set("toObject", { virtuals: true });

export default (mongoose.models.File as Model<IFile, {}, IFileMethods> &
  IFileModel) ||
  mongoose.model<IFile, Model<IFile, {}, IFileMethods> & IFileModel>(
    "File",
    FileSchema,
  );
