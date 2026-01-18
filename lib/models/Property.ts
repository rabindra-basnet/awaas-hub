import mongoose, { Schema, model, models, Types } from "mongoose";

export interface IProperty {
    title: string;
    price: number;
    location: string;
    status: "available" | "pending" | "sold";
    description: string,
    isFavorite: boolean,
    sellerId: Types.ObjectId; // MongoDB ObjectId from Better Auth user
    createdAt: Date;
    images: string[];
}

const PropertySchema = new Schema<IProperty>({
    title: { type: String, required: true },
    price: { type: Number, required: true },
    location: { type: String, required: true },
    status: {
        type: String,
        enum: ["available", "pending", "sold"],
        default: "available",
    },
    isFavorite: { type: Boolean },
    description: { type: String },
    sellerId: { type: Schema.Types.ObjectId, ref: "users", required: true, index: true },
    images: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now },
});

PropertySchema.index({ sellerId: 1, status: 1 });

export const Property = models.Property || model<IProperty>("Property", PropertySchema);
