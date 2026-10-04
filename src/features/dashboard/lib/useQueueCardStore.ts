import { create } from "zustand";
import type { Track } from "@/features/library/lib/tracks";
import { usePlayerStore } from "@/features/player/lib/usePlayerStore";

export type QueueView = "next" | "playlist";

// 사이드바 QueueCard(components/QueueCard.tsx)의 탭("재생 트랙"/"재생목록") 상태. 원래 QueueCard 안의 useState
// 였는데, 라이브러리·재생목록 상세·곡 정보 페이지에서 특정 곡의 재생 버튼을 누르면
// "재생 트랙" 탭을 열어줘야 해서(사용자 요청) 바깥에서도 열 수 있게 스토어로 뺐습니다.
// 그 재생 버튼들은 전부 아래 playTrackAndOpenQueue 하나만 부릅니다.
//
// scrollRequest는 탭을 열 때마다(이미 열려 있는 탭이어도) 1씩 올라가고, QueueCard가
// 이 값이 바뀌는 걸 보고 지금 재생 중인 곡/재생목록 행으로 스크롤합니다.
//
// 스토어는 QueueCard가 사라져도 남기 때문에, 로그아웃 후 다시 로그인했을 때 이전
// 탭이 남아 있지 않도록 QueueCard가 언마운트될 때 reset으로 "재생 트랙"으로 되돌립니다
// (useState였을 때와 같은 동작).
interface QueueCardState {
  view: QueueView;
  scrollRequest: number;
  selectTab: (view: QueueView) => void;
  reset: () => void;
}

export const useQueueCardStore = create<QueueCardState>()((set) => ({
  view: "next",
  scrollRequest: 0,
  selectTab: (view) =>
    set((s) => ({ view, scrollRequest: s.scrollRequest + 1 })),
  reset: () => set({ view: "next" }),
}));

// 사용자가 곡 하나를 골라 재생 버튼을 눌렀을 때(라이브러리/헤더 검색 결과/재생목록
// 상세/곡 정보 페이지) 재생하면서 사이드바 "재생 트랙" 탭을 엽니다. 탭을 열면
// QueueCard가 지금 재생 중인 곡 행으로 스크롤합니다. 재생 규칙 자체는
// usePlayerStore.playTrackFrom 참고. "전체 재생"/셔플(playQueue)이나 자동 다음 곡
// (playNext)처럼 곡 하나를 직접 고른 게 아닌 경우는 탭을 열지 않으므로 여기를 거치지
// 않습니다.
export function playTrackAndOpenQueue(
  tracks: Track[],
  index: number,
  playlistId?: string,
) {
  usePlayerStore.getState().playTrackFrom(tracks, index, playlistId);
  useQueueCardStore.getState().selectTab("next");
}
