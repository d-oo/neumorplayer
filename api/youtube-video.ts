import type { VercelRequest, VercelResponse } from "@vercel/node";
import { YOUTUBE_API_BASE, getApiKeyOrThrow } from "./_youtube.js";

// GET /api/youtube-video?id=영상ID[,영상ID2,...]
// old-src/src/components/AddMusic.js 의 videos 조회(제목/썸네일/재생시간)를 대체합니다.
// YouTube Data API의 videos.list는 id에 콤마로 구분한 여러 ID를 한 번에 받을 수 있어서,
// 검색 결과 카드 여러 개의 재생시간/조회수를 한 번의 요청으로 채울 때도 그대로 씁니다
// (탐색 화면에서 검색 결과 각각을 개별 요청하지 않도록).
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = req.query.id;
  if (typeof id !== "string" || id.trim() === "") {
    return res.status(400).json({ error: "쿼리 파라미터 id가 필요합니다." });
  }

  try {
    const apiKey = getApiKeyOrThrow();
    const url = new URL(`${YOUTUBE_API_BASE}/videos`);
    url.searchParams.set("part", "snippet,contentDetails,statistics,status");
    url.searchParams.set(
      "fields",
      "items(id,snippet(thumbnails,title,channelTitle),contentDetails/duration,statistics/viewCount,status/madeForKids)"
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
