// 입력창이 공유하는 sunken 배경 — 탐색 화면의 제목/아티스트/태그 입력창, 헤더의
// "라이브러리 내 검색", 랜딩 탐색 카드가 모두 같은 값을 씁니다(원래 탐색 전용이라
// features/explore/lib에 있었는데, 특정 도메인을 대표하지 않아 여기로 옮겼습니다).
// 같은 폴더의 sunkenPanelStyle과 값이 비슷하지만 배경·그림자가 서로 달라 별도입니다.
export const fieldBoxStyle = {
  background: "var(--neu-ink-915)",
  boxShadow: "var(--neu-shadow-field)",
};
