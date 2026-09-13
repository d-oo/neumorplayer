import type { VercelRequest, VercelResponse } from "@vercel/node";
import { YOUTUBE_API_BASE, getApiKeyOrThrow } from "./_youtube.js";

// GET /api/youtube-search?q=검색어
// 예전엔 이 요청을 브라우저에서 REACT_APP_API_KEY를 붙여 직접 호출했습니다
// (old-src/src/components/AddMusic.js). 이제 키는 이 서버리스 함수 안에만 존재합니다.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const q = req.query.q;
  if (typeof q !== "string" || q.trim() === "") {
    return res.status(400).json({ error: "쿼리 파라미터 q가 필요합니다." });
  }

  try {
    const apiKey = getApiKeyOrThrow();
    const url = new URL(`${YOUTUBE_API_BASE}/search`);
    url.searchParams.set("part", "snippet");
    url.searchParams.set(
      "fields",
      "items(id/videoId,snippet(thumbnails,title,channelTitle))"
    );
    url.searchParams.set("maxResults", "5");
    url.searchParams.set("type", "video");
    url.searchParams.set("q", q);
    url.searchParams.set("key", apiKey);

    const ytRes = await fetch(url);
    const data = await ytRes.json();
    if (!ytRes.ok) {
      return res.status(ytRes.status).json(data);
    }

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate");
    return res.status(200).json(data);
  } catch (err) {
    return res
      .status(500)
      .json({ error: err instanceof Error ? err.message : "unknown error" });
  }
}
