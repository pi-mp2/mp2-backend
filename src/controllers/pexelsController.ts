import { Request, Response } from "express";
import { createClient, Video } from "pexels";

const client = createClient(process.env.PEXELS_API_KEY!);

interface VideoFileData {
    quality: string;
    link: string;
}

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

    // Tipas tú mismo los archivos de video
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