import { parseIsoDuration } from "@/shared/lib/format-time";

export interface ExploreResult {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  durationSec: number;
  viewCount: number;
}

interface YoutubeSearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: {
      medium?: { url: string };
      default?: { url: string };
    };
  };
}

interface YoutubeVideoItem {
  id: string;
  contentDetails?: { duration: string };
  statistics?: { viewCount: string };
  status?: { madeForKids?: boolean };
}

// old-src/src/components/AddMusic.js의 아티스트 콤마 분리 규칙을 그대로 옮겼습니다:
// 콤마로 나눠 각 조각을 trim하고 내부 중복 공백을 하나로 줄인 뒤, 중복된 이름은
// Set으로 걸러냅니다(예: "IU, Suga,  Suga " → ["IU", "Suga"]).
export function parseArtists(value: string): string[] {
  return [
    ...new Set(value.split(",").map((s) => s.trim().replace(/ +(?= )/g, ""))),
  ];
}

// YouTube Data API는 제목/채널명을 HTML 엔티티로 이스케이프해서 돌려줍니다
// (예: "Guns N' Roses" → "Guns N&#39; Roses") — 화면에 그대로 뿌리면 엔티티가
// 안 풀린 채로 보이니, 브라우저의 HTML 파서를 빌려 디코딩합니다.
function decodeHtmlEntities(text: string): string {
  const el = document.createElement("textarea");
  el.innerHTML = text;
  return el.value;
}

// /api/youtube-search가 돌려주는 { items, details } 응답을 화면에서 쓰는 ExploreResult[]로
// 바꿉니다. q 검색(fetchExploreResults)과 비디오 ID 단건 조회(fetchExploreResultByVideoId)가
// 같은 응답 모양을 쓰므로 파싱 로직을 여기 하나로 모았습니다.
function parseExploreResponse(data: {
  items?: YoutubeSearchItem[];
  details?: YoutubeVideoItem[];
}): ExploreResult[] {
  const items = data.items ?? [];
  if (items.length === 0) return [];

  const detailById = new Map(
    (data.details ?? []).map((item) => [item.id, item]),
  );

  // YouTube API Developer Policies E.4.i: Made For Kids로 지정된 영상은 결과에서
  // 제외합니다(라이브러리 추가·게스트 재생 등 이 함수를 거치는 모든 경로가 같이 커버됨).
  // detail을 못 찾은 경우(삭제된 영상 등)는 기존 동작대로 통과시킵니다.
  return items
    .filter(
      (item) => detailById.get(item.id.videoId)?.status?.madeForKids !== true,
    )
    .map((item) => {
      const detail = detailById.get(item.id.videoId);
      return {
        videoId: item.id.videoId,
        title: decodeHtmlEntities(item.snippet.title),
        channelTitle: decodeHtmlEntities(item.snippet.channelTitle),
        thumbnailUrl:
          item.snippet.thumbnails.medium?.url ??
          item.snippet.thumbnails.default?.url ??
          "",
        durationSec: detail?.contentDetails
          ? parseIsoDuration(detail.contentDetails.duration)
          : 0,
        viewCount: detail?.statistics
          ? Number(detail.statistics.viewCount)
          : 0,
      };
    });
}

// /api/youtube-search 한 번으로 후보와 각 영상의 재생시간·조회수·아동용 여부를 함께
// 받아옵니다. 예전엔 이 두 가지를 브라우저가 순차로 두 번 호출했는데, 두 번째 요청이
// 첫 번째 결과를 기다려야 해서 왕복 지연이 그대로 두 배가 됐습니다(자세한 배경은
// api/youtube-search.ts 주석 참고).
// "앨범"은 YouTube Data API에 없는 개념이라 표시하지 않습니다.
export async function fetchExploreResults(
  query: string,
): Promise<ExploreResult[]> {
  const res = await fetch(`/api/youtube-search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("YouTube 검색에 실패했습니다.");
  return parseExploreResponse(await res.json());
}

// 탐색 화면에서 비디오 ID를 직접 붙여넣었을 때 쓰는 단건 조회. 존재하지 않는 ID면
// 빈 배열을 돌려줍니다(에러가 아니라 "일치하는 곡 없음"으로 취급).
export async function fetchExploreResultByVideoId(
  videoId: string,
): Promise<ExploreResult[]> {
  const res = await fetch(`/api/youtube-search?id=${encodeURIComponent(videoId)}`);
  if (!res.ok) throw new Error("YouTube 조회에 실패했습니다.");
  return parseExploreResponse(await res.json());
}
