// 세그먼트 탭을 감싸는 컨테이너(HomeLayout의 nav, LibraryPage 정렬 탭, QueueCard
// 토글)와 QueueCard의 새 재생목록 이름 입력창이 공유하는 "sunken" 배경 — 조건 분기가
// 없는 고정 값이라 함수가 아니라 상수로 export합니다.
export const sunkenPanelStyle = {
  background: "oklch(0.908 0.014 315)",
  boxShadow:
    "inset 3px 3px 7px rgba(150,136,175,0.34), inset -3px -3px 6px rgba(255,255,255,0.85)",
};
