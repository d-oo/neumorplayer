import type { VercelRequest, VercelResponse } from "@vercel/node";
import { YOUTUBE_API_BASE, getApiKeyOrThrow } from "./_youtube.js";

// GET /api/youtube-video?id=영상ID
// old-src/src/components/AddMusic.js 의 videos 조회(제목/썸네일/재생시간)를 대체합니다.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = req.query.id;
  if (typeof id !== "string" || id.trim() === "") {
    return res.status(400).json({ error: "쿼리 파라미터 id가 필요합니다." });
  }

  try {
    const apiKey = getApiKeyOrThrow();
    const url = new URL(`${YOUTUBE_API_BASE}/videos`);
    url.searchParams.set("part", "snippet,contentDetails");
    url.searchParams.set(
      "fields",
      "items(snippet(thumbnails,title,channelTitle),contentDetails/duration)"
    );
    url.searchParams.set("id", id);
    url.searchParams.set("key", apiKey);

    const ytRes = await fetch(url);
    const data = await ytRes.json();
    if (!ytRes.ok) {
      return res.status(ytRes.status).json(data);
    }

    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
    return res.status(200).json(data);
  } catch (err) {
    return res
      .status(500)
      .json({ error: err instanceof Error ? err.message : "unknown error" });
  }
}
