// Set에 값이 있으면 빼고 없으면 넣은 새 Set을 돌려줍니다(원본은 그대로) — React
// 상태로 들고 있는 선택 목록을 토글할 때 씁니다(탐색 화면 태그 선택, 곡 상세의
// "재생목록에 추가" 모달 체크, 재생목록 상세의 곡 선택).
export function toggleInSet<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}
