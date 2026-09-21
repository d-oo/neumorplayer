// 세그먼트 탭(HomeLayout의 라이브러리/탐색, LibraryPage의 정렬 옵션, QueueCard의
// 재생트랙/재생목록)이 공유하는 active/inactive 색상·그림자 값. 세 곳 다 렌더링하는
// 요소(NavLink/button)와 동작(라우팅/정렬토글/단순토글)이 서로 달라서 컴포넌트로
// 묶지 않고, 완전히 동일한 이 계산 값만 함수로 뽑았습니다. className(패딩/글자
// 크기)은 컨텍스트마다 실제로 달라서 호출부에 그대로 둡니다.
export function segmentTabStyle(active: boolean) {
  return {
    color: active ? "#6d1a9f" : "oklch(0.47 0.025 315)",
    background: active
      ? "color-mix(in oklab, #b344ff 14%, transparent)"
      : "transparent",
    boxShadow: active
      ? "2px 2px 5px rgba(150,136,175,0.34), -2px -2px 4px rgba(255,255,255,0.7)"
      : "none",
  };
}
