import { Router } from "express";
import { searchPexelsVideos } from "@controllers/pexelsController";

const router = Router();

/**
 * @file pexelsRoutes.ts
 * @description Defines routes for interacting with the Pexels API to fetch video content.
 * 
 * The routes in this module are public and allow users to search for videos
 * based on a query string provided in the request parameters.
 */

/**
 * GET /api/pexels/videos
 * Searches for videos on Pexels using the provided query parameter.
 * 
 * Query Parameters:
 * - `query` (string): The search term to look up videos.
 * - `per_page` (number, optional): The number of videos to return (default: 5).
 * 
 * Example:
 * ```
 * GET /api/pexels/videos?query=nature&per_page=10
 * ```
 * 
 * @route GET /videos
 * @access Public
 */
router.get("/videos", searchPexelsVideos);

export default router;
