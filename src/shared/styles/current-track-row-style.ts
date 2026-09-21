// "지금 재생 중인 트랙" 행 하이라이트 — SearchResultsView/LibraryPage/PlaylistInfoPage가
// 완전히 동일한 값을 쓰지만, 행 자체의 마크업(flex vs grid, 컬럼 수, dnd-kit
// transform/transition 유무)은 제각각이라 컴포넌트가 아니라 이 계산값만 함수로
// 뽑았습니다(segmentTabStyle과 같은 이유).
export function currentTrackRowStyle(active: boolean) {
  return {
    background: active ? "oklch(0.945 0.035 313)" : "transparent",
    boxShadow: active
      ? "2px 2px 6px rgba(150,136,175,0.38), -2px -2px 5px rgba(255,255,255,0.8)"
      : "none",
  };
}
