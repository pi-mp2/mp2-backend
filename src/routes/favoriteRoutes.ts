import { Router } from "express";
import { verifyToken } from "@middleware/auth";
import { addFavorite, removeFavorite, getFavorites } from "@controllers/favoriteController";

const router = Router();

router.post("/", verifyToken, addFavorite);
router.get("/", verifyToken, getFavorites);
router.delete("/:id", verifyToken, removeFavorite);

export default router;
