import multer from "multer";

// Guarda los archivos directamente en memoria (no en disco)
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB máximo
});
