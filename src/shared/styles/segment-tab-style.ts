// 세그먼트 탭(HomeLayout의 라이브러리/탐색, LibraryPage의 정렬 옵션, QueueCard의
// 재생트랙/재생목록)이 공유하는 active/inactive 배경 값. 세 곳 다 렌더링하는
// 요소(NavLink/button)와 동작(라우팅/정렬토글/단순토글)이 서로 달라서 컴포넌트로
// 묶지 않고, 완전히 동일한 이 계산 값만 함수로 뽑았습니다. className(패딩/글자
// 크기)은 컨텍스트마다 실제로 달라서 호출부에 그대로 둡니다.
//
// color/boxShadow는 예전엔 여기서 인라인으로 같이 반환했지만, hover(:hover로 글자색
// 진하게)와 press(:active로 함몰 그림자) 의사클래스 효과를 추가하면서 호출부의
// Tailwind 클래스(text-neu-hi/text-neu-muted, shadow-neu-tab-raised,
// active:shadow-neu-tab-active)로 옮겼습니다 — 인라인 style은 어떤 클래스보다도
// 항상 이겨서, color/boxShadow를 여기서 계속 반환하면 그 클래스들이 죽은 코드가
// 됩니다. background는 hover/active 어느 쪽과도 안 겹치므로 인라인으로 남겨도
// 안전합니다.
export function segmentTabStyle(active: boolean) {
  return {
    background: active
      ? "color-mix(in oklab, #b344ff 14%, transparent)"
      : "transparent",
  };
}
