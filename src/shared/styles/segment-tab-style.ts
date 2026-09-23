// 세그먼트 탭(HomeLayout의 라이브러리/탐색, LibraryPage의 정렬 옵션, QueueCard의
// 재생트랙/재생목록, SettingsModal의 라이트/다크)이 공유하는 active/inactive 배경과
// 클래스. 렌더링하는 요소(NavLink/button)와 동작(라우팅/정렬토글/단순토글)이 서로
// 달라 컴포넌트로는 묶지 않고, 모든 호출부가 똑같이 쓰던 값만 함수로 뽑았습니다.
// 패딩·글자 크기·flex 여부는 자리마다 실제로 달라서 호출부에 그대로 둡니다 — 그래서
// segmentTabClass에는 어느 호출부도 덮어쓰지 않는 것만 들어 있습니다.
//
// color/boxShadow는 예전엔 style로 같이 반환했지만, hover(:hover로 글자색 진하게)와
// press(:active로 함몰 그림자) 의사클래스 효과를 추가하면서 Tailwind 클래스로
// 옮겼습니다 — 인라인 style은 어떤 클래스보다도 항상 이겨서, 여기서 계속 반환하면
// 그 클래스들이 죽은 코드가 됩니다. background는 hover/active 어느 쪽과도 안 겹치므로
// 인라인으로 남겨도 안전합니다.
export function segmentTabStyle(active: boolean) {
  return {
    background: active ? "var(--neu-accent-tint)" : "transparent",
  };
}

export function segmentTabClass(active: boolean) {
  return `rounded-[9px] font-bold transition-shadow duration-150 hover:text-[oklch(0.24_0.025_315)] active:shadow-neu-tab-active ${
    active ? "text-neu-hi shadow-neu-tab-raised" : "text-neu-muted"
  }`;
}
