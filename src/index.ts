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

const PORT = process.env.PORT || 4000;

const app = express();

// ✅ Middlewares básicos
app.use(express.json());
app.use(cookieParser());

// ✅ Configuración CORS segura y funcional
const allowedOrigins = [
  process.env.CLIENT_URL || "https://mp2-frontend.vercel.app",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// ✅ Rutas
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/pexels", pexelsRoutes);
app.use("/api/favorites", favoriteRoutes);

// Conectar a la base de datos y levantar el servidor
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error("❌ Error connecting to database:", err);
});

export default app;
