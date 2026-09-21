// 실제 썸네일이 없을 때(TrackThumbnail의 로드 실패, ExplorePage 검색 결과 카드의
// 채널 아바타) 공통으로 쓰는 스트라이프 placeholder 배경 — 마크업(img 대체 vs 원형
// 아바타)은 서로 달라서 컴포넌트로 묶지 않고 계산된 값만 여기로 뽑았습니다.
export const thumbnailPlaceholderBackground =
  "repeating-linear-gradient(135deg, rgba(118,100,145,0.16) 0 5px, rgba(118,100,145,0.05) 5px 10px), color-mix(in oklab, #b344ff 14%, transparent)";
