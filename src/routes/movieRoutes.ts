import { Router } from "express";
import {
  createMovie,
  getMyMovies,
  getMovies,
  updateMovie,
  deleteMovie,
  uploadMovieVideo,
  watchMovie,
  getMovieById
} from "@controllers/movieController";
import { upload } from "@middleware/upload";
import { verifyToken } from "@middleware/auth";

const router = Router();

/**
 * @file movieRoutes.ts
 * @description Defines all routes related to movie management, including upload, creation, retrieval, updates, and deletion.
 * 
 * Routes are divided between public access (e.g., fetching movies) and protected access (requiring user authentication via JWT).
 */

/**
 * GET /api/movies/:id
 * Retrieves a movie by its unique ID.
 * 
 * @route GET /:id
 * @access Public
 */
router.get("/:id", getMovieById);

/**
 * POST /api/movies/upload
 * Uploads a movie video file. The file is stored in memory and then handled by the controller.
 * 
 * @route POST /upload
 * @middleware verifyToken, upload.single("file")
 * @access Private
 */
router.post("/upload", verifyToken, upload.single("file"), uploadMovieVideo);

/**
 * GET /api/movies/my
 * Retrieves all movies created by the authenticated user.
 * 
 * @route GET /my
 * @middleware verifyToken
 * @access Private
 */
router.get("/my", verifyToken, getMyMovies);

/**
 * GET /api/movies/watch/:id
 * Allows users to watch a specific movie by its ID.
 * 
 * @route GET /watch/:id
 * @access Public
 */
router.get("/watch/:id", watchMovie);

/**
 * POST /api/movies
 * Creates a new movie associated with the authenticated user.
 * 
 * @route POST /
 * @middleware verifyToken
 * @access Private
 */
router.post("/", verifyToken, createMovie);

/**
 * GET /api/movies
 * Retrieves a list of movies, optionally filtered or paginated.
 * 
 * @route GET /
 * @access Public
 */
router.get("/", getMovies);

/**
 * PUT /api/movies/:id
 * Updates movie details by ID. Only the owner of the movie can modify it.
 * 
 * @route PUT /:id
 * @middleware verifyToken
 * @access Private
 */
router.put("/:id", verifyToken, updateMovie);

/**
 * DELETE /api/movies/:id
 * Deletes a movie by ID. Associated favorites are also removed automatically.
 * 
 * @route DELETE /:id
 * @middleware verifyToken
 * @access Private
 */
router.delete("/:id", verifyToken, deleteMovie);

export default router;
