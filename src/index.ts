import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "@config/db";

import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import movieRoutes from "./routes/movieRoutes";
import pexelsRoutes from "./routes/pexelsRoutes";
import favoriteRoutes from "./routes/favoriteRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ✅ Configuración CORS segura y funcional
const allowedOrigins = [
  process.env.CLIENT_URL || "https://mp2-frontend.vercel.app",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // permite enviar y recibir cookies
  })
);

// ✅ Middlewares básicos
app.use(express.json());
app.use(cookieParser());

// ✅ Rutas
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/pexels", pexelsRoutes);
app.use("/api/favorites", favoriteRoutes);

// ✅ Ruta de prueba
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "🚀 API running correctly" });
});

// ✅ Conexión DB + servidor
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
});
