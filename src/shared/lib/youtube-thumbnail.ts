// tracks 테이블엔 썸네일 URL을 따로 저장하지 않습니다(video_id만 있음) — YouTube가
// 영상마다 이 고정 경로로 썸네일을 제공하므로, 저장/동기화 없이 그때그때 조합해서
// 씁니다(old-src/src/components/PlaylistMusic.js도 같은 방식).
//
// medium(mqdefault, 320×180)이 기본값입니다 — 목록 행/재생목록 커버처럼 실제
// 렌더링 크기가 그보다 훨씬 작은 대부분의 자리엔 이걸로 충분합니다. 트랙 상세의
// 368×207 비디오 영역처럼 원본보다 크게 표시되는 자리는 high(hqdefault, 480×360)를
// 써야 확대되며 흐려지지 않습니다.
export function getYoutubeThumbnailUrl(
  videoId: string,
  quality: "medium" | "high" = "medium",
): string {
  const file = quality === "high" ? "hqdefault" : "mqdefault";
  return `https://i.ytimg.com/vi/${videoId}/${file}.jpg`;
}
