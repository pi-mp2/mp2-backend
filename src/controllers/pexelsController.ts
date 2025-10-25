/**
 * @fileoverview Controller for fetching stock videos from the Pexels API.
 * Provides a single endpoint to search and return curated video data,
 * including resolution links and thumbnails.
 */

import { Request, Response } from "express";
import { createClient, Video } from "pexels";

const client = createClient(process.env.PEXELS_API_KEY!);

/**
 * Represents the structure of a video file returned by Pexels API.
 * @interface
 */
interface VideoFileData {
  /** Video quality (e.g., hd, sd, hls) */
  quality: string;
  /** Direct URL link to the video file */
  link: string;
}

/**
 * Fetches videos from Pexels API based on a given search query.
 *
 * This endpoint allows clients to retrieve stock videos from the Pexels platform
 * filtered by a search term and limited by pagination size.
 *
 * @async
 * @function searchPexelsVideos
 * @param {Request} req - Express request object containing query parameters:
 *  - `query`: The search term to look for.
 *  - `per_page`: Optional number of results per page (default: 5).
 * @param {Response} res - Express response object used to send results or errors.
 * @returns {Promise<Response>} A JSON response with a list of videos or an error message.
 *
 * @example
 * // Example request:
 * GET /api/pexels?query=space&per_page=3
 *
 * // Example response:
 * {
 *   "message": "✅ Videos fetched successfully",
 *   "videos": [
 *     {
 *       "id": 12345,
 *       "url": "https://www.pexels.com/video/12345/",
 *       "duration": 12,
 *       "image": "https://images.pexels.com/photos/12345.jpeg",
 *       "videoFiles": [
 *         { "quality": "hd", "link": "https://player.pexels.com/hd.mp4" },
 *         { "quality": "sd", "link": "https://player.pexels.com/sd.mp4" }
 *       ]
 *     }
 *   ]
 * }
 */
export const searchPexelsVideos = async (req: Request, res: Response) => {
  try {
    const query = req.query.query as string;
    const perPage = parseInt(req.query.per_page as string) || 5;

    if (!query) {
      return res.status(400).json({ message: "❌ Missing 'query' parameter" });
    }

    const result = await client.videos.search({ query, per_page: perPage });

    if (!("videos" in result)) {
      return res.status(500).json({ message: "❌ Error from Pexels API", result });
    }

    // Strongly type each video file to ensure consistent response structure
    const videos = (result.videos as Video[]).map((v) => ({
      id: v.id,
      url: v.url,
      duration: v.duration,
      image: v.image,
      videoFiles: v.video_files.map((f: VideoFileData) => ({
        quality: f.quality,
        link: f.link,
      })),
    }));

    return res.json({
      message: "✅ Videos fetched successfully",
      videos,
    });
  } catch (error: any) {
    console.error("❌ Error fetching videos from Pexels:", error);
    res.status(500).json({ message: "Error fetching videos", error: error.message });
  }
};
