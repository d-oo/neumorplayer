// /api 함수 두 곳(검색, 영상 상세)에서 공통으로 쓰는 헬퍼.
// YOUTUBE_API_KEY는 Vercel 대시보드에 "서버 전용" 환경변수로만 등록하세요 (VITE_ 접두사 금지).

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

export function getApiKeyOrThrow(): string {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    throw new Error("YOUTUBE_API_KEY 환경변수가 설정되지 않았습니다.");
  }
  return key;
}

export { YOUTUBE_API_BASE };

// videos.list 요청 주소. 검색 결과의 상세 조회·비디오 ID 단건 조회(youtube-search)와
// 30일 갱신 배치(cron/refresh-youtube-data)가 씁니다. part/fields는 호출부마다 필요한
// 값이 달라서 받습니다.
export function buildVideosUrl(
  apiKey: string,
  ids: string[],
  part: string,
  fields: string,
): URL {
  const url = new URL(`${YOUTUBE_API_BASE}/videos`);
  url.searchParams.set("part", part);
  url.searchParams.set("fields", fields);
  url.searchParams.set("id", ids.join(","));
  url.searchParams.set("key", apiKey);
  return url;
}
