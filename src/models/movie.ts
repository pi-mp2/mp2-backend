import mongoose, { Schema, model, Document } from "mongoose";
import { Favorite } from "./favorite";

export interface IMovie extends Document {
  title: string;
  description?: string;
  genre: string[];
  year: number;
  videoUrl: string;
  user: mongoose.Types.ObjectId; 
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  publicId: string;
  altText?: string;          // accesibilidad
  transcript?: string;       // accesibilidad
  contrastRatio?: number;    // accesibilidad
}

const movieSchema = new Schema<IMovie>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, "Title must be at least 2 characters"],
    },
    description: { type: String, trim: true },
    genre: { type: [String], required: true},
    year: {
      type: Number,
      required: true,
      min: [1900, "Year must be greater than 1900"],
      max: [new Date().getFullYear(), "Year cannot be in the future"],
    },
    videoUrl: {
      type: String,
      required: false,
      match: [/^https?:\/\/.+/, "Video URL must be valid"],
    },
    user: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true },
    isPublic: { type: Boolean, default: false },
    publicId: {
      type: String,
      required: false,
    },
    //Campos accesibilidad
    altText: { type: String, trim: true },
    transcript: { type: String, trim: true },
    contrastRatio: { type: Number, min: 1, max: 21 },
  },
  { timestamps: true }
);

//Hook: cuando se elimina una película, también borra sus favoritos
movieSchema.pre("findOneAndDelete", async function (next) {
  try {
    const movieId = this.getQuery()._id;
    if (movieId) {
      await Favorite.deleteMany({ movie: movieId });
      console.log(`Favoritos eliminados para la película ${movieId}`);
    }
    next();
  } catch (err: any) { 
    console.error("Error al eliminar favoritos asociados:", err);
    next(err as Error); 
  }
});

// Índices para búsquedas y paginación eficiente
movieSchema.index({ title: "text", genre: 1, year: 1 });
movieSchema.index({ createdAt: -1 });
movieSchema.index({ isPublic: 1 });

export const Movie = mongoose.model<IMovie>("Movie", movieSchema);