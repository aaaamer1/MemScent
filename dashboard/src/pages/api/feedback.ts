import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

type FeedbackEntry = {
  memory: string;
  recipe: { name: string; components: { oil: string; percent: number }[] };
  rating: number;
  timestamp: number;
};

const MAP_PATH = path.join(process.cwd(), "../cloud/memory_map.json");
const FB_PATH  = path.join(process.cwd(), "../cloud/feedback.json");

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { memory, rating } = req.body as { memory: string; rating: number };
  const key = memory.trim().toLowerCase();

  //load the cache map to grab the exact recipe
  const map: Record<string, any> = JSON.parse(
    fs.readFileSync(MAP_PATH, "utf-8")
  );

  //load existing feedback, or fresh
  let fbData: FeedbackEntry[] = [];
  try {
    fbData = JSON.parse(fs.readFileSync(FB_PATH, "utf-8"));
  } catch {
    // file may not exist yet
  }

  if (map[key]?.recipe) {
    fbData.push({
      memory: key,
      recipe: map[key].recipe,
      rating,
      timestamp: Date.now(),
    });
    fs.writeFileSync(FB_PATH, JSON.stringify(fbData, null, 2));
  }

  //if thumbs-down, remove from memory_map
  if (map[key] && rating < 3) {
    delete map[key];
    fs.writeFileSync(MAP_PATH, JSON.stringify(map, null, 2));
  }

  return res.status(200).json({ ok: true });
}
