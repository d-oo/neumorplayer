// "지금 재생 중인 트랙" 행 하이라이트 — SearchResultsView/LibraryPage/PlaylistInfoPage가
// 완전히 동일한 값을 쓰지만, 행 자체의 마크업(flex vs grid, 컬럼 수, dnd-kit
// transform/transition 유무)은 제각각이라 컴포넌트가 아니라 이 계산값만 함수로
// 뽑았습니다(segmentTabStyle과 같은 이유). 배경/그림자 값 자체는 index.css의
// --neu-highlight/--neu-shadow-highlight 토큰(ProfileDropdown 메뉴 항목의 hover와
// 공유)을 그대로 참조합니다.
export function currentTrackRowStyle(active: boolean) {
  return {
    background: active ? "var(--neu-highlight)" : "transparent",
    boxShadow: active ? "var(--neu-shadow-highlight)" : "none",
  };
}
