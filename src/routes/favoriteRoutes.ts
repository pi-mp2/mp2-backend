import { Router } from "express";
import { verifyToken } from "@middleware/auth";
import { addFavorite, removeFavorite, getFavorites } from "@controllers/favoriteController";

const router = Router();

/**
 * @file favoriteRoutes.ts
 * @description Defines routes for managing user favorite movies.
 * 
 * These routes allow authenticated users to add, view, and remove favorite movies.
 * All endpoints are protected by JWT authentication middleware.
 */

/**
 * POST /api/favorites
 * Adds a movie to the authenticated user's favorites list.
 * 
 * @route POST /
 * @middleware verifyToken
 * @access Private
 */
router.post("/", verifyToken, addFavorite);

/**
 * GET /api/favorites
 * Retrieves all favorite movies for the authenticated user.
 * 
 * @route GET /
 * @middleware verifyToken
 * @access Private
 */
router.get("/", verifyToken, getFavorites);

/**
 * DELETE /api/favorites/:id
 * Removes a specific movie from the user's favorites by its ID.
 * 
 * @route DELETE /:id
 * @middleware verifyToken
 * @access Private
 */
router.delete("/:id", verifyToken, removeFavorite);

export default router;
