import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Database } from "@/lib/database.types";

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

  playQueue: (tracks: Track[], startIndex: number, playlistId?: string) => void;
  playNext: () => void;
  playPrev: () => void;
  setIsPlaying: (playing: boolean) => void;
  setVideoOn: (on: boolean) => void;
  toggleLoopTrack: () => void;
  toggleLoopQueue: () => void;
  toggleShuffle: () => void;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
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

      playQueue: (tracks, startIndex, playlistId) =>
        set({
          queue: tracks,
          currentIndex: startIndex,
          playingPlaylistId: playlistId ?? null,
          videoOn: true,
          loopTrack: false,
        }),

      playNext: () => {
        const { queue, currentIndex, loopQueue } = get();
        if (queue.length === 0) return;
        if (currentIndex < queue.length - 1) {
          set({ currentIndex: currentIndex + 1 });
        } else if (loopQueue) {
          set({ currentIndex: 0 });
        } else {
          set({ queue: [], currentIndex: -1, playingPlaylistId: null });
        }
      },

      playPrev: () => {
        const { queue, currentIndex, loopQueue } = get();
        if (queue.length === 0) return;
        if (currentIndex > 0) {
          set({ currentIndex: currentIndex - 1 });
        } else if (loopQueue) {
          set({ currentIndex: queue.length - 1 });
        }
      },

      setIsPlaying: (playing) => set({ isPlaying: playing }),
      setVideoOn: (on) => set({ videoOn: on }),
      toggleLoopTrack: () => set((s) => ({ loopTrack: !s.loopTrack })),
      toggleLoopQueue: () => set((s) => ({ loopQueue: !s.loopQueue })),
      toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),
      setVolume: (volume) => set({ volume }),
      setMuted: (muted) => set({ muted }),
    }),
    {
      name: "ytmusic-player-settings",
      // 큐/재생목록 같은 휘발성 상태는 저장하지 않고, 볼륨/음소거처럼 "환경설정"만 유지합니다.
      partialize: (state) => ({ volume: state.volume, muted: state.muted }),
    }
  )
);
