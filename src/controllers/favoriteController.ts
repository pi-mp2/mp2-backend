/**
 * @fileoverview Controller for managing user favorites.
 * Handles adding, removing, and retrieving favorite movies.
 */

import { Request, Response } from "express";
import { Favorite } from "@models/favorite";
import { AuthRequest } from "@middleware/auth";

/**
 * Adds a movie to the authenticated user's list of favorites.
 *
 * Validates that both user ID and movie ID exist, prevents duplicates,
 * and saves the favorite entry in the database.
 *
 * @async
 * @function addFavorite
 * @param {AuthRequest} req - Express request with authenticated user and movie ID in body.
 * @param {Response} res - Express response object.
 * @returns {Promise<Response>} JSON response with created favorite or error message.
 *
 * @example
 * POST /api/favorites
 * {
 *   "movieId": "671139df1e5d3d00122f345b"
 * }
 */
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

/**
 * Removes a movie from the authenticated user's list of favorites.
 *
 * Ensures that the favorite belongs to the logged-in user before deletion.
 *
 * @async
 * @function removeFavorite
 * @param {AuthRequest} req - Express request with favorite ID in params and authenticated user.
 * @param {Response} res - Express response object.
 * @returns {Promise<Response>} JSON response confirming deletion or error message.
 *
 * @example
 * DELETE /api/favorites/:id
 */
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

/**
 * Retrieves all favorite movies for the authenticated user.
 *
 * Populates movie details and sorts results by creation date (descending).
 *
 * @async
 * @function getFavorites
 * @param {AuthRequest} req - Express request with authenticated user.
 * @param {Response} res - Express response object.
 * @returns {Promise<Response>} JSON response containing favorite movies and total count.
 *
 * @example
 * GET /api/favorites
 * // -> { "total": 3, "favorites": [ ... ] }
 */
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
