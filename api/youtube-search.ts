import type { VercelRequest, VercelResponse } from "@vercel/node";
import { YOUTUBE_API_BASE, getApiKeyOrThrow } from "./_youtube.js";

// 검색 결과로 돌려줄 영상 개수.
const RESULT_COUNT = 6;
// search.list는 type=video를 줘도 질의가 채널 이름과 강하게 일치하면 그 채널을 결과
// 맨 앞에 끼워 넣습니다(실측 확인 — "newjeans" 검색 시 1번이 kind=youtube#channel).
// 그런 항목을 걸러내고도 RESULT_COUNT개를 채울 수 있도록 넉넉히 받습니다. maxResults는
// 할당량에 영향이 없습니다(search.list는 호출 한 번당 100 units 고정).
const FETCH_COUNT = 10;

interface SearchItem {
  id?: { videoId?: string };
}

type VideoSearchItem = SearchItem & { id: { videoId: string } };

// GET /api/youtube-search?q=검색어
// → { items: [search 결과], details: [각 영상의 재생시간/조회수/아동용 여부] }
//
// 예전엔 search와 videos.list를 각각 별도 엔드포인트로 두고 브라우저가 "순차로" 두 번
// 호출했는데, 두 번째 호출은 첫 번째 결과의 videoId가 나와야 시작할 수 있어서 왕복
// 지연이 그대로 두 배가 됐습니다. 두 호출을 여기서 이어 붙이면 브라우저 왕복이 1번으로
// 줄고, 서버(Vercel)와 구글 사이는 빠르기 때문에 합친 비용이 거의 묻힙니다 — 실측으로
// 로컬 vercel dev 기준 4.2초 → 2.6초였습니다(별도였던 api/youtube-video.ts는 이때
// 호출부가 사라져 삭제했습니다).
//
// 키는 이 서버리스 함수 안에만 존재합니다(예전엔 브라우저가 REACT_APP_API_KEY를 붙여
// 직접 호출했습니다 — old-src/src/components/AddMusic.js).
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const q = req.query.q;
  if (typeof q !== "string" || q.trim() === "") {
    return res.status(400).json({ error: "쿼리 파라미터 q가 필요합니다." });
  }

  try {
    const apiKey = getApiKeyOrThrow();

    const searchUrl = new URL(`${YOUTUBE_API_BASE}/search`);
    searchUrl.searchParams.set("part", "snippet");
    searchUrl.searchParams.set(
      "fields",
      "items(id/videoId,snippet(thumbnails,title,channelTitle))"
    );
    searchUrl.searchParams.set("maxResults", String(FETCH_COUNT));
    searchUrl.searchParams.set("type", "video");
    searchUrl.searchParams.set("q", q);
    searchUrl.searchParams.set("key", apiKey);

    const searchRes = await fetch(searchUrl);
    const searchData = (await searchRes.json()) as { items?: SearchItem[] };
    if (!searchRes.ok) {
      return res.status(searchRes.status).json(searchData);
    }

    // videoId가 없는 항목(위 주석의 채널 결과)을 걸러냅니다 — 그대로 내려보내면
    // 화면에 썸네일도 재생시간도 없는 빈 카드가 하나 생기고, 그걸 고르면 video_id가
    // 비어 있는 트랙이 라이브러리에 저장됩니다.
    const items = (searchData.items ?? [])
      .filter((item): item is VideoSearchItem => !!item.id?.videoId)
      .slice(0, RESULT_COUNT);
    const ids = items.map((item) => item.id.videoId);

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate");
    if (ids.length === 0) {
      return res.status(200).json({ items, details: [] });
    }

    // 화면에서 실제로 쓰는 값만 받습니다 — 제목/썸네일/채널명은 위 search 결과에
    // 이미 있으므로 여기선 snippet을 요청하지 않습니다.
    const videosUrl = new URL(`${YOUTUBE_API_BASE}/videos`);
    videosUrl.searchParams.set("part", "contentDetails,statistics,status");
    videosUrl.searchParams.set(
      "fields",
      "items(id,contentDetails/duration,statistics/viewCount,status/madeForKids)"
    );
    videosUrl.searchParams.set("id", ids.join(","));
    videosUrl.searchParams.set("key", apiKey);

    const videosRes = await fetch(videosUrl);
    const videosData = (await videosRes.json()) as { items?: unknown[] };
    if (!videosRes.ok) {
      return res.status(videosRes.status).json(videosData);
    }

    return res.status(200).json({ items, details: videosData.items ?? [] });
  } catch (err) {
    return res
      .status(500)
      .json({ error: err instanceof Error ? err.message : "unknown error" });
  }
}
