import mongoose, { Schema, model, Document } from "mongoose";

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
      required: true,
      match: [/^https?:\/\/.+/, "Video URL must be valid"],
    },
    user: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true },
    isPublic: { type: Boolean, default: false },
    publicId: {
      type: String,
      required: true,
    }
  },
  { timestamps: true }
);

export const Movie = model<IMovie>("Movie", movieSchema);