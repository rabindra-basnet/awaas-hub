import mongoose, { Schema, model, models, Types } from "mongoose";

export interface IFavorite {
  userId: Types.ObjectId;
  propertyId: Types.ObjectId;
  createdAt: Date;
}

const FavoriteSchema = new Schema<IFavorite>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },

    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      index: true,
    },

    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);

// 🔹 Ensure a user can favorite a property only once
FavoriteSchema.index({ userId: 1, propertyId: 1 }, { unique: true });

// // 🔹 Optional: Limit max number of favorites per user
// // This is not enforced by Mongoose directly, but can be done in pre-save hook
// FavoriteSchema.pre("save", async function (next) {
//   const doc = this as IFavorite & { userId: Types.ObjectId };
//   const count = await Favorite.countDocuments({ userId: doc.userId });
//   const MAX_FAVORITES = 50; // example limit
//   if (count >= MAX_FAVORITES) {
//     throw new Error(`You can only favorite up to ${MAX_FAVORITES} properties.`);
//   }
// });

export const Favorite =
  models.Favorite || model<IFavorite>("Favorite", FavoriteSchema);
