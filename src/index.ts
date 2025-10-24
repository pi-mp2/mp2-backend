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

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(helmet());

/*const allowedOrigins: string[] = [
  process.env.CLIENT_URL || "https://mp2-frontend.vercel.app", // Render o dominio del frontend
  "http://localhost:5173",      // entorno local
].filter(Boolean) as string[]; // elimina strings vacíos

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
  })
);*/

app.use(cors({ origin: "*", credentials: false }));

// Rutas Principales
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/pexels", pexelsRoutes);
app.use("/api/favorites", favoriteRoutes);

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "API is running 🚀" });
});

// Conectar DB y arrancar server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
});