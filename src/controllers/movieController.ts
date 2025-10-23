import { Request, Response } from "express";
import { Movie } from "@models/movie";
import cloudinary from "@config/cloudinary";
import streamifier from "streamifier";
import { AuthRequest } from "@middleware/auth";

// Crear película manualmente (opcional)
export const createMovie = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "❌ Unauthorized" });

    const movie = new Movie({ ...req.body, user: userId });
    await movie.save();
    res.status(201).json(movie);
  } catch (error: any) {
    res.status(400).json({ message: "❌ Error creating movie", error: error.message });
  }
};

// Obtener solo las películas del usuario autenticado
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

// Solo devuelve las peliculas publicas
export const getMovies = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, genre, year, search, sortBy = "createdAt", order = "desc" } = req.query;

    const filters: any = { isPublic: true }; // 👈 Solo públicas

    if (genre) filters.genre = { $in: (genre as string).split(",") };
    if (year) filters.year = Number(year);
    if (search) filters.title = { $regex: search, $options: "i" };

    const sort: any = { [sortBy as string]: order === "asc" ? 1 : -1 };

    const movies = await Movie.find(filters)
      .sort(sort)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate("user", "email username");

    const total = await Movie.countDocuments(filters);

    res.json({
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      movies,
    });
  } catch (error: any) {
    res.status(500).json({ message: "❌ Error fetching movies", error: error.message });
  }
};

// Actualizar película (solo el dueño puede hacerlo)
export const updateMovie = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const movie = await Movie.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      req.body,
      { new: true }
    );

    if (!movie) return res.status(404).json({ message: "Movie not found or not authorized" });
    res.json(movie);
  } catch (error: any) {
    res.status(400).json({ message: "❌ Error updating movie", error: error.message });
  }
};

// Eliminar película (solo el dueño)
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

// Subir video a Cloudinary y guardar en la base de datos
export const uploadMovieVideo = async (req: AuthRequest, res: Response) => {
  try {
    const file = req.file;
    const userId = req.user?.id;
    const isPublic = req.body.isPublic === "true"; // viene del frontend

    if (!file) return res.status(400).json({ message: "❌ No video file uploaded" });
    if (!userId) return res.status(401).json({ message: "❌ Unauthorized" });

    console.log("Uploading video to Cloudinary...");

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "video",
        folder: "movies_app/videos",
        access_mode: "public", // según la elección del usuario
      },
      async (error, result) => {
        if (error || !result) {
          console.error("❌ Error uploading to Cloudinary:", error);
          return res.status(500).json({ message: "❌ Error uploading video", error });
        }

      const movie = new Movie({
        title: req.body.title || "Untitled",
        description: req.body.description || "",
        genre: req.body.genre ? req.body.genre.split(",") : ["Uncategorized"],
        year: req.body.year ? Number(req.body.year) : new Date().getFullYear(),
        videoUrl: result.secure_url,
        publicId: result.public_id,
        user: userId,
        isPublic: req.body.isPublic === "true",
      });


        await movie.save();

        res.status(201).json({
          message: "✅ Video uploaded and saved successfully",
          movie: {
            ...movie.toObject(),
            videoUrl: movie.isPublic ? movie.videoUrl : null, // Si no es público, no enviar URL
          }
        });
      }
    );

    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  } catch (error: any) {
    console.error("❌ Error uploading movie:", error);
    res.status(500).json({ message: "Error uploading movie", error: error.message });
  }
};

// GET /api/movies/watch/:id
export const watchMovie = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const userId = req.user?.id;
    const movie = await Movie.findById(id);

    if (!movie) return res.status(404).json({ message: "❌ Movie not found" });

    // Si el video es privado, solo el dueño puede verlo
    if (!movie.isPublic && movie.user.toString() !== userId) {
      return res.status(403).json({ message: "🚫 This video is private" });
    }

    return res.json({ videoUrl: movie.videoUrl });
  } catch (error: any) {
    res.status(500).json({ message: "❌ Error fetching movie", error: error.message });
  }
};

// GET /api/movies/:id → Devuelve todos los datos de una película
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

