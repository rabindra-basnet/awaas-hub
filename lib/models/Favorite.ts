import mongoose, { Schema, model, models, Types } from "mongoose";

export interface IFavorite {
    userId: Types.ObjectId;
    propertyId: Types.ObjectId;
    createdAt: Date;
}

const FavoriteSchema = new Schema<IFavorite>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "users", required: true, index: true },
        propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true, index: true },
        createdAt: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
    }
);

// Optional: prevent duplicate favorite for same user-property
FavoriteSchema.index({ userId: 1, propertyId: 1 }, { unique: true });

export const Favorite = models.Favorite || model<IFavorite>("Favorite", FavoriteSchema);
