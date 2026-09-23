// 세그먼트 탭을 감싸는 컨테이너(HomeLayout의 nav, LibraryPage 정렬 탭, QueueCard
// 토글)와 QueueCard의 새 재생목록 이름 입력창이 공유하는 "sunken" 배경 — 조건 분기가
// 없는 고정 값이라 함수가 아니라 상수로 export합니다.
export const sunkenPanelStyle = {
  background: "var(--neu-surface-sunken)",
  boxShadow: "var(--neu-shadow-sunken-panel)",
};
