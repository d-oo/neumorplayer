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
