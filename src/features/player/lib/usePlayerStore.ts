import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Database } from "@/shared/lib/database.types";

type Track = Database["public"]["Tables"]["tracks"]["Row"];

interface PlayerState {
  // 현재 재생 중인 트랙/큐 — 서버 데이터(tracks/playlists)는 TanStack Query가 들고 있고,
  // 여기엔 "지금 무엇을 어떻게 재생 중인가"라는 순수 클라이언트 상태만 둡니다.
  queue: Track[];
  currentIndex: number;
  playingPlaylistId: string | null;
  loopTrack: boolean;
  loopQueue: boolean;
  shuffle: boolean;
  isPlaying: boolean;
  videoOn: boolean;
  volume: number; // 0-100, 새로고침 후에도 유지
  muted: boolean; // 새로고침 후에도 유지
  currentTime: number; // 초 단위, YouTubePlayer가 주기적으로 채워줌
  duration: number; // 초 단위
  pendingSeek: number | null; // PlayerPanel이 요청하고 YouTubePlayer가 처리 후 비움

  playQueue: (tracks: Track[], startIndex: number, playlistId?: string) => void;
  playNext: () => void;
  playPrev: () => void;
  jumpTo: (index: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setVideoOn: (on: boolean) => void;
  toggleLoopTrack: () => void;
  toggleLoopQueue: () => void;
  toggleShuffle: () => void;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  setProgress: (currentTime: number, duration: number) => void;
  requestSeek: (time: number) => void;
  clearPendingSeek: () => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      queue: [],
      currentIndex: -1,
      playingPlaylistId: null,
      loopTrack: false,
      loopQueue: false,
      shuffle: false,
      isPlaying: false,
      videoOn: false,
      volume: 50,
      muted: false,
      currentTime: 0,
      duration: 0,
      pendingSeek: null,

      // isPlaying을 여기서 미리 true로 만들지 않습니다 — 유튜브 영상은 로드에
      // 잠깐(약 1초) 시간이 걸리는데, 미리 true로 두면 아직 실제로는 재생되지
      // 않는데도 CD가 돌고 재생 버튼이 일시정지 아이콘으로 바뀌어 버립니다
      // (old-src도 onPlayerStateChange의 실제 PLAYING 이벤트가 왔을 때만
      // isPlaying을 true로 바꿨습니다 — YT.js 참고). 실제 true 전환은
      // YouTubePlayer.tsx의 onStateChange가 담당하고, 그때까지 영상 자체는
      // opts.playerVars.autoplay로 알아서 재생을 시작합니다.
      playQueue: (tracks, startIndex, playlistId) =>
        set({
          queue: tracks,
          currentIndex: startIndex,
          playingPlaylistId: playlistId ?? null,
          videoOn: true,
          isPlaying: false,
          loopTrack: false,
          currentTime: 0,
          duration: 0,
        }),

      playNext: () => {
        const { queue, currentIndex, loopQueue } = get();
        if (queue.length === 0) return;
        if (currentIndex < queue.length - 1) {
          set({ currentIndex: currentIndex + 1, currentTime: 0, duration: 0 });
        } else if (loopQueue) {
          set({ currentIndex: 0, currentTime: 0, duration: 0 });
        } else {
          set({ queue: [], currentIndex: -1, playingPlaylistId: null });
        }
      },

      playPrev: () => {
        const { queue, currentIndex, loopQueue } = get();
        if (queue.length === 0) return;
        if (currentIndex > 0) {
          set({ currentIndex: currentIndex - 1, currentTime: 0, duration: 0 });
        } else if (loopQueue) {
          set({ currentIndex: queue.length - 1, currentTime: 0, duration: 0 });
        }
      },

      // 지금 재생 중인 큐는 그대로 두고, 그 안의 다른 곡으로 바로 건너뜁니다
      // ("다음 트랙" 목록에서 특정 곡을 클릭했을 때). isPlaying을 false로 두는 이유는
      // playQueue와 같습니다 — 실제 재생 시작은 YouTubePlayer.tsx의 onStateChange가
      // 알려줄 때까지 기다립니다.
      jumpTo: (index) => {
        const { queue } = get();
        if (index < 0 || index >= queue.length) return;
        set({
          currentIndex: index,
          isPlaying: false,
          currentTime: 0,
          duration: 0,
        });
      },

      setIsPlaying: (playing) => set({ isPlaying: playing }),
      setVideoOn: (on) => set({ videoOn: on }),
      toggleLoopTrack: () => set((s) => ({ loopTrack: !s.loopTrack })),
      toggleLoopQueue: () => set((s) => ({ loopQueue: !s.loopQueue })),
      toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),
      setVolume: (volume) => set({ volume }),
      setMuted: (muted) => set({ muted }),
      setProgress: (currentTime, duration) => set({ currentTime, duration }),
      requestSeek: (time) => set({ pendingSeek: time }),
      clearPendingSeek: () => set({ pendingSeek: null }),
    }),
    {
      name: "neumorplayer-player-settings",
      // 큐/재생목록 같은 휘발성 상태는 저장하지 않고, 볼륨/음소거처럼 "환경설정"만 유지합니다.
      partialize: (state) => ({ volume: state.volume, muted: state.muted }),
    },
  ),
);
