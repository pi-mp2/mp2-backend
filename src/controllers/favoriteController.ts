import { Request, Response } from "express";
import { Favorite } from "@models/favorite";
import { AuthRequest } from "@middleware/auth";

export const addFavorite = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { movieId } = req.body;

    if (!userId || !movieId) {
      return res.status(400).json({ message: "❌ Missing user or movie ID" });
    }

    const existing = await Favorite.findOne({ user: userId, movie: movieId });
    if (existing) {
      return res.status(400).json({ message: "❌ Movie already in favorites" });
    }

    const favorite = new Favorite({ user: userId, movie: movieId });
    await favorite.save();

    res.status(201).json({ message: "✅ Added to favorites", favorite });
  } catch (error: any) {
    res.status(500).json({ message: "❌ Error adding favorite", error: error.message });
  }
};

export const removeFavorite = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const favorite = await Favorite.findOneAndDelete({ _id: id, user: userId });
    if (!favorite) {
      return res.status(404).json({ message: "❌ Favorite not found or not yours" });
    }

    res.json({ message: "✅ Removed from favorites" });
  } catch (error: any) {
    res.status(500).json({ message: "❌ Error removing favorite", error: error.message });
  }
};

export const getFavorites = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const favorites = await Favorite.find({ user: userId })
      .populate("movie")
      .sort({ createdAt: -1 });

    res.json({ total: favorites.length, favorites });
  } catch (error: any) {
    res.status(500).json({ message: "❌ Error fetching favorites", error: error.message });
  }
};