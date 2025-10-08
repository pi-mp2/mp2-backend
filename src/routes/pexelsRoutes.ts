import { Router } from "express";
import { searchPexelsVideos } from "@controllers/pexelsController";

const router = Router();

// GET porque es una búsqueda
router.get("/videos", searchPexelsVideos);

export default router;