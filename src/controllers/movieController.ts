/**
 * @fileoverview Controller for handling movie management operations.
 * Supports movie creation (manual or via video upload), retrieval, updates, deletion,
 * and access control for public/private movies.
 */

import { Request, Response } from "express";
import { Movie } from "@models/movie";
import cloudinary from "@config/cloudinary";
import streamifier from "streamifier";
import { AuthRequest } from "@middleware/auth";

/**
 * Creates a new movie manually without uploading a video.
 *
 * Validates required fields and assigns default genre if not provided.
 *
 * @async
 * @function createMovie
 * @param {AuthRequest} req - Express request with user authentication and movie details.
 * @param {Response} res - Express response object.
 * @returns {Promise<Response>} JSON with created movie or error message.
 *
 * @example
 * POST /api/movies
 * {
 *   "title": "Interstellar",
 *   "description": "A journey through space and time.",
 *   "genre": "Sci-Fi, Adventure",
 *   "year": 2014,
 *   "isPublic": true
 * }
 */
export const createMovie = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "❌ Unauthorized" });

    const { title, description, genre, year, isPublic } = req.body;

    if (!title || !description || !year) {
      return res.status(400).json({ message: "❌ Faltan campos obligatorios (title, description, year)" });
    }

    const movie = new Movie({
      title,
      description,
      genre: genre ? genre.split(",") : ["Uncategorized"],
      year,
      isPublic: isPublic === "true",
      user: userId,
    });

    await movie.save();
    res.status(201).json({ message: "✅ Movie created successfully", movie });
  } catch (error: any) {
    res.status(400).json({ message: "❌ Error creating movie", error: error.message });
  }
};

/**
 * Retrieves all movies created by the authenticated user.
 *
 * @async
 * @function getMyMovies
 * @param {AuthRequest} req - Express request with authenticated user.
 * @param {Response} res - Express response object.
 * @returns {Promise<Response>} JSON containing user's movies.
 */
export const getMyMovies = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "❌ Unauthorized" });

    const movies = await Movie.find({ user: userId }).sort({ createdAt: -1 });
    res.json({ total: movies.length, movies });
  } catch (error: any) {
    res.status(500).json({ message: "❌ Error fetching user movies", error: error.message });
  }
};

/**
 * Retrieves all public movies with optional filters, search, and pagination.
 *
 * Supports filters for genre, year, and text search in title.
 *
 * @async
 * @function getMovies
 * @param {AuthRequest} req - Express request with optional query parameters.
 * @param {Response} res - Express response object.
 * @returns {Promise<Response>} JSON response with paginated movie list.
 *
 * @example
 * GET /api/movies?genre=Sci-Fi&year=2023&page=2&limit=5
 */
export const getMovies = async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      genre,
      year,
      search,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const filters: any = { isPublic: true };
    if (genre) filters.genre = { $in: (genre as string).split(",") };
    if (year) filters.year = Number(year);
    if (search) filters.title = { $regex: search, $options: "i" };

    const sort: any = { [sortBy as string]: order === "asc" ? 1 : -1 };
    const pageNum = Math.max(Number(page), 1);
    const limitNum = Math.min(Math.max(Number(limit), 1), 50);

    const [movies, total] = await Promise.all([
      Movie.find(filters)
        .sort(sort)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .populate("user", "email username")
        .lean(),
      Movie.countDocuments(filters),
    ]);

    res.json({
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      limit: limitNum,
      data: movies,
    });
  } catch (error: any) {
    res.status(500).json({ message: "❌ Error fetching movies", error: error.message });
  }
};

/**
 * Updates a movie if it belongs to the authenticated user.
 *
 * @async
 * @function updateMovie
 * @param {AuthRequest} req - Express request with movie ID and updated fields.
 * @param {Response} res - Express response object.
 * @returns {Promise<Response>} JSON with updated movie or error message.
 */
export const updateMovie = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const movie = await Movie.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      req.body,
      { new: true }
    );

    if (!movie) return res.status(404).json({ message: "Movie not found or not authorized" });
    res.json({ message: "✅ Movie updated", movie });
  } catch (error: any) {
    res.status(400).json({ message: "❌ Error updating movie", error: error.message });
  }
};

/**
 * Deletes a movie and removes its video from Cloudinary (if applicable).
 *
 * @async
 * @function deleteMovie
 * @param {AuthRequest} req - Express request with movie ID and authenticated user.
 * @param {Response} res - Express response object.
 * @returns {Promise<Response>} JSON confirmation of deletion or error message.
 */
export const deleteMovie = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const movie = await Movie.findOneAndDelete({ _id: req.params.id, user: userId });

    if (!movie) return res.status(404).json({ message: "Movie not found or not authorized" });
    res.json({ message: "✅ Movie Deleted" });
  } catch (error: any) {
    res.status(500).json({ message: "❌ Error deleting movie", error: error.message });
  }
};

/**
 * Uploads a video file to Cloudinary and creates a movie entry.
 *
 * Streams the uploaded file directly from memory using `streamifier`.
 *
 * @async
 * @function uploadMovieVideo
 * @param {AuthRequest} req - Express request with file buffer and movie data.
 * @param {Response} res - Express response object.
 * @returns {Promise<Response>} JSON with created movie details or error message.
 */
export const uploadMovieVideo = async (req: AuthRequest, res: Response) => {
  try {
    const file = req.file;
    const userId = req.user?.id;
    const { title, description, genre, year, isPublic } = req.body;

    if (!file) return res.status(400).json({ message: "❌ No video file uploaded" });
    if (!userId) return res.status(401).json({ message: "❌ Unauthorized" });
    if (!title || !description || !year)
      return res.status(400).json({ message: "❌ Faltan campos obligatorios (title, description, year)" });

    console.log("🚀 Subiendo video a Cloudinary...");

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "video",
        folder: "movies_app/videos",
      },
      async (error, result) => {
        if (error || !result) {
          console.error("❌ Error uploading to Cloudinary:", error);
          return res.status(500).json({ message: "❌ Error uploading video", error });
        }

        const movie = new Movie({
          title,
          description,
          genre: genre ? genre.split(",") : ["Uncategorized"],
          year: Number(year),
          videoUrl: result.secure_url,
          publicId: result.public_id,
          user: userId,
          isPublic: isPublic === "true",
        });

        await movie.save();

        res.status(201).json({
          message: "✅ Video uploaded and saved successfully",
          movie: {
            ...movie.toObject(),
            videoUrl: movie.isPublic ? movie.videoUrl : null,
          },
        });
      }
    );

    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  } catch (error: any) {
    console.error("❌ Error uploading movie:", error);
    res.status(500).json({ message: "Error uploading movie", error: error.message });
  }
};

/**
 * Returns the video URL of a movie if it is public or belongs to the authenticated user.
 *
 * @async
 * @function watchMovie
 * @param {AuthRequest} req - Express request with movie ID and user authentication.
 * @param {Response} res - Express response object.
 * @returns {Promise<Response>} JSON with video URL or error message.
 */
export const watchMovie = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const movie = await Movie.findById(id);

    if (!movie) return res.status(404).json({ message: "❌ Movie not found" });
    if (!movie.isPublic && movie.user.toString() !== userId) {
      return res.status(403).json({ message: "🚫 This video is private" });
    }

    res.json({ videoUrl: movie.videoUrl });
  } catch (error: any) {
    res.status(500).json({ message: "❌ Error fetching movie", error: error.message });
  }
};

/**
 * Retrieves detailed information about a specific movie by its ID.
 *
 * Populates user information associated with the movie.
 *
 * @async
 * @function getMovieById
 * @param {Request} req - Express request with movie ID in params.
 * @param {Response} res - Express response object.
 * @returns {Promise<Response>} JSON with movie details or error message.
 */
export const getMovieById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const movie = await Movie.findById(id).populate("user", "username email");

    if (!movie) return res.status(404).json({ message: "❌ Movie not found" });

    res.json({
      message: "✅ Movie fetched successfully",
      movie,
    });
  } catch (error: any) {
    res.status(500).json({ message: "❌ Error fetching movie", error: error.message });
  }
};
