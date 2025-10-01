import { Request, Response } from "express";
import { Movie } from "@models/movie"; // usando alias y named export

// Create Movie
export const createMovie = async (req: Request, res: Response) => {
  try {
    const movie = new Movie(req.body);
    await movie.save();
    res.status(201).json(movie);
  } catch (error) {
    res.status(400).json({ message: "❌ Error creating movie", error });
  }
};

// Get all movies
export const getMovies = async (_req: Request, res: Response) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: "❌ Error fetching movies", error });
  }
};

// Get single movie
export const getMovieById = async (req: Request, res: Response) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: "❌ Error fetching movie", error });
  }
};

// Update movie
export const updateMovie = async (req: Request, res: Response) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.json(movie);
  } catch (error) {
    res.status(400).json({ message: "❌ Error updating movie", error });
  }
};

// Delete movie
export const deleteMovie = async (req: Request, res: Response) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.json({ message: "✅ Movie deleted" });
  } catch (error) {
    res.status(500).json({ message: "❌ Error deleting movie", error });
  }
};