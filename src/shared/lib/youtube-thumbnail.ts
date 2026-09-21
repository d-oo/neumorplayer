// tracks 테이블엔 썸네일 URL을 따로 저장하지 않습니다(video_id만 있음) — YouTube가
// 영상마다 이 고정 경로로 썸네일을 제공하므로, 저장/동기화 없이 그때그때 조합해서
// 씁니다(old-src/src/components/PlaylistMusic.js도 같은 방식).
export function getYoutubeThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
}
