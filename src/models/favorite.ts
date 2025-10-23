import mongoose, { Schema, Document } from "mongoose";

export interface IFavorite extends Document {
  user: mongoose.Schema.Types.ObjectId;
  movie: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
}

const favoriteSchema = new Schema<IFavorite>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  movie: { type: Schema.Types.ObjectId, ref: "Movie", required: true },
  createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

// Evita duplicados (usuario + película única)
favoriteSchema.index({ user: 1, movie: 1 }, { unique: true });

export const Favorite = mongoose.model<IFavorite>("Favorite", favoriteSchema);