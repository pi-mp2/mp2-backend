import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";

import { connectDB } from "@config/db";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import movieRoutes from "./routes/movieRoutes";
import pexelsRoutes from "./routes/pexelsRoutes";
import favoriteRoutes from "./routes/favoriteRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

/**
 * @file server.ts
 * @description Main entry point of the backend server.  
 * Sets up Express, connects to the database, applies security middlewares,
 * and registers all API routes for authentication, users, movies, favorites, and external services.
 */


/**
 * Parses incoming JSON requests.
 * Enables cookies for authentication.
 * Adds security headers via Helmet.
 */
app.use(express.json());
app.use(cookieParser());
app.use(helmet());

/**
 * Allowed origins for CORS.
 * Includes both local and production environments.
 */
const allowedOrigins: string[] = [
  process.env.CLIENT_URL || "https://mp2-frontend.vercel.app", // Production frontend
  "http://localhost:5173", // Local development
].filter(Boolean) as string[]; // Removes falsy values

/**
 * Enables Cross-Origin Resource Sharing (CORS)
 * with credentials support (for cookies / JWT-based auth).
 */
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);


/**
 * Main API route registration.
 * Each module handles a specific resource or feature domain.
 */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/pexels", pexelsRoutes);
app.use("/api/favorites", favoriteRoutes);

/**
 * Default root route — used as a simple health check.
 * @route GET /
 */
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "API is running 🚀" });
});


/**
 * Connects to the MongoDB database and starts the Express server.
 * Logs the local server URL once successfully running.
 */
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
});
