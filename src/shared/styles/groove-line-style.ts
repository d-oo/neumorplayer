// 음각(파인 홈) 구분선 — 로그인 화면 "또는" 구분선(AuthForm의 Divider)과 대시보드
// 메인 카드의 헤더/본문 구분선(HomeLayout)이 공유합니다. 두께(h-0.5)·둥근 끝
// (rounded-xs)·여백은 호출부 마크업이 정하고 여기선 색과 그림자만 줍니다. 조건 분기가
// 없는 고정 값이라 함수가 아니라 상수로 export합니다.
export const grooveLineStyle = {
  background: "var(--neu-surface-sunken)",
  boxShadow: "var(--neu-shadow-divider-line)",
};
