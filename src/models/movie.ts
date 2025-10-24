import mongoose, { Schema, model, Document } from "mongoose";
import { Favorite } from "./favorite";

/**
 * Interface representing a Movie document in MongoDB.
 * 
 * Includes metadata for accessibility, ownership, and visibility,
 * as well as hooks to maintain data consistency (e.g., cascade delete favorites).
 */
export interface IMovie extends Document {
  title: string;                // Movie title
  description?: string;         // Optional description or synopsis
  genre: string[];              // List of genres (e.g., ["Action", "Drama"])
  year: number;                 // Year of release
  videoUrl: string;             // Link to hosted video (e.g., Cloudinary URL)
  user: mongoose.Types.ObjectId; // Reference to the user who uploaded the movie
  isPublic: boolean;            // Visibility flag (public/private)
  createdAt: Date;              // Auto-generated timestamp
  updatedAt: Date;              // Auto-generated timestamp
  publicId: string;             // Cloud storage public identifier (e.g., Cloudinary)
  altText?: string;             // Accessibility: text alternative for visual media
  transcript?: string;          // Accessibility: full text transcript of dialogue/audio
  contrastRatio?: number;       // Accessibility: color contrast (1–21)
}

/**
 * Mongoose schema for Movie documents.
 * 
 * Includes validation rules, accessibility fields, and timestamps.
 */
const movieSchema = new Schema<IMovie>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, "Title must be at least 2 characters"],
    },
    description: { type: String, trim: true },
    genre: { type: [String], required: true },
    year: {
      type: Number,
      required: true,
      min: [1900, "Year must be greater than 1900"],
      max: [new Date().getFullYear(), "Year cannot be in the future"],
    },
    videoUrl: {
      type: String,
      required: true,
      match: [/^https?:\/\/.+/, "Video URL must be valid"],
    },
    user: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    isPublic: { type: Boolean, default: false },
    publicId: {
      type: String,
      required: true,
    },
    // Accessibility fields
    altText: { type: String, trim: true },
    transcript: { type: String, trim: true },
    contrastRatio: { type: Number, min: 1, max: 21 },
  },
  { timestamps: true }
);

/**
 * Pre-hook: Automatically delete all Favorite records associated
 * with a movie when it is removed from the database.
 */
movieSchema.pre("findOneAndDelete", async function (next) {
  try {
    const movieId = this.getQuery()._id;
    if (movieId) {
      await Favorite.deleteMany({ movie: movieId });
      console.log(`Favorites removed for deleted movie ${movieId}`);
    }
    next();
  } catch (err: any) { 
    console.error("Error deleting related favorites:", err);
    next(err as Error); 
  }
});

/**
 * Indexes for faster searches, filtering, and pagination:
 * - Text index on `title` for keyword searches
 * - Index on `genre` and `year` for filtering
 * - Index on `createdAt` for sorting (newest first)
 * - Index on `isPublic` for visibility queries
 */
movieSchema.index({ title: "text", genre: 1, year: 1 });
movieSchema.index({ createdAt: -1 });
movieSchema.index({ isPublic: 1 });

/**
 * Movie model representing the "movies" collection in MongoDB.
 */
export const Movie = mongoose.model<IMovie>("Movie", movieSchema);
