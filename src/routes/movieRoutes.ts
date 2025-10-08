import { Router } from "express";
import {
  createMovie,
  getMyMovies,
  getMovies,
  updateMovie,
  deleteMovie,
  uploadMovieVideo,
  watchMovie,
} from "@controllers/movieController";
import { upload } from "@middleware/upload";
import { verifyToken } from "@middleware/auth";

const router = Router();

// Subir video (requiere token)
router.post("/upload", verifyToken, upload.single("file"), uploadMovieVideo);

// Películas del usuario autenticado
router.get("/my", verifyToken, getMyMovies);

router.get("/watch/:id", watchMovie);

// Resto de rutas
router.post("/", verifyToken, createMovie);
router.get("/", getMovies);
router.put("/:id", verifyToken, updateMovie);
router.delete("/:id", verifyToken, deleteMovie);

export default router;
