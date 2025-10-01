import { Schema, model, Document } from "mongoose";

export interface IMovie extends Document {
  title: string;
  description?: string;
  genre: string[];
  year: number;
  duration?: number;
  thumbnailUrl: string;
  videoUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const movieSchema = new Schema<IMovie>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [2, "Title must be at least 2 characters"],
    },
    description: {
      type: String,
      trim: true,
    },
    genre: {
      type: [String],
      required: [true, "At least one genre is required"],
    },
    year: {
      type: Number,
      required: [true, "Year is required"],
      min: [1900, "Year must be greater than 1900"],
      max: [new Date().getFullYear(), "Year cannot be in the future"],
    },
    duration: {
      type: Number,
      min: [1, "Duration must be at least 1 minute"],
    },
    thumbnailUrl: {
      type: String,
      required: [true, "Thumbnail URL is required"],
      match: [/^https?:\/\/.+/, "Thumbnail URL must be valid"],
    },
    videoUrl: {
      type: String,
      required: [true, "Video URL is required"],
      match: [/^https?:\/\/.+/, "Video URL must be valid"],
    },
  },
  { timestamps: true }
);

export const Movie = model<IMovie>("Movie", movieSchema);