// // API response types
export interface FileUploadResponse {
  _id: string | Types.ObjectId;
  filename: string;
  storedName: string;
  url: string;
  mimetype: string;
  size: number;
  readableSize?: string;
  isPrivate: boolean;
  createdAt: Date | string;
  message?: string;
}

export interface FileListResponse {
  files: FileUploadResponse[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface FileDeleteResponse {
  message: string;
  fileId: string | Types.ObjectId;
}

// Upload parameters
export interface UploadParams {
  file: File;
  isPrivate: boolean;
  propertyId?: string;
}

// Query parameters
export interface FileQueryParams {
  userId?: string;
  propertyId?: string;
  isPrivate?: boolean;
  page?: number;
  limit?: number;
}

// types/file.types.ts (fixed)

import { Types, Document, Model } from "mongoose";

// Base interface (fields only)
export interface IFile {
  userId: Types.ObjectId;
  propertyId?: Types.ObjectId;
  filename: string;
  storedName: string;
  isPrivate: boolean;
  mimetype: string;
  size: number;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Virtuals
export interface IFileVirtuals {
  url: string;
  readableSize: string;
}

// Instance methods
export interface IFileMethods {
  softDelete(): Promise<IFileDocument>;
  restore(): Promise<IFileDocument>;
}

// Static methods
export interface IFileModel extends Model<IFileDocument, {}, IFileMethods> {
  findActiveByUser(
    userId: Types.ObjectId | string,
    options?: { propertyId?: Types.ObjectId | string; isPrivate?: boolean },
  ): Promise<IFileDocument[]>;
  findByStoredName(storedName: string): Promise<IFileDocument | null>;
}

// Final document type
export type IFileDocument = Document<unknown, {}, IFile> &
  IFile &
  IFileVirtuals &
  IFileMethods;
