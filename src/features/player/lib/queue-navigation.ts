import { isTrackPlayable, type Track } from "@/features/library/lib/tracks";

// 큐에서 currentIndex 다음(step=1) 또는 이전(step=-1)의 재생 가능한 곡 index를 찾습니다.
// 재생 불가 곡(isTrackPlayable)은 건너뜁니다 — 곡이 끝나 자동으로 넘어갈 때와
// 이전/다음 곡 버튼이 같은 규칙을 쓰도록 usePlayerStore(playNext/playPrev)와
// PlayerPanel(버튼 비활성화)이 함께 씁니다.
//
// loop(반복)가 켜져 있으면 끝에서 처음으로(또는 반대로) 넘어가며 찾고, 한 바퀴를 다 돌아
// 현재 곡 자신에 닿으면 그 index를 돌려줍니다(반복 중 재생 가능한 곡이 현재 곡뿐인 경우 —
// 곡이 하나뿐인 큐에서 반복을 켰을 때 예전 동작과 같음). 반복이 꺼져 있으면 큐 끝을
// 넘지 않고, 찾지 못하면 -1입니다.
export function findPlayableIndex(
  queue: Track[],
  currentIndex: number,
  step: 1 | -1,
  loop: boolean,
): number {
  const n = queue.length;
  for (let offset = 1; offset <= n; offset++) {
    const raw = currentIndex + step * offset;
    if (!loop && (raw < 0 || raw >= n)) return -1;
    const index = ((raw % n) + n) % n;
    if (isTrackPlayable(queue[index])) return index;
  }
  return -1;
}
