import mongoose, { Schema, Document } from "mongoose";

/**
 * Interface representing a user's favorite movie record.
 * 
 * Each favorite links a specific user with a specific movie.
 * Duplicates (same user + same movie) are automatically prevented
 * through a unique compound index.
 */
export interface IFavorite extends Document {
  user: mongoose.Schema.Types.ObjectId;  // Reference to the User who favorited the movie
  movie: mongoose.Schema.Types.ObjectId; // Reference to the Movie that was favorited
  createdAt: Date;                       // Timestamp of when the favorite was created
}

/**
 * Mongoose schema for the Favorite model.
 * 
 * - `user`: ObjectId reference to a User document.
 * - `movie`: ObjectId reference to a Movie document.
 * - `createdAt`: Automatically set to the current date/time.
 */
const favoriteSchema = new Schema<IFavorite>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    movie: { type: Schema.Types.ObjectId, ref: "Movie", required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false } // Disables the "__v" version key
);

// Prevent duplicate entries (a user cannot favorite the same movie twice)
favoriteSchema.index({ user: 1, movie: 1 }, { unique: true });

/**
 * Mongoose model for the "Favorite" collection.
 * 
 * Represents the relationship between users and their favorite movies.
 */
export const Favorite = mongoose.model<IFavorite>("Favorite", favoriteSchema);
