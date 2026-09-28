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
  // YouTube가 마지막으로 알려온 상태가 PLAYING인지 — isPlaying은 "재생하려는 의도"라
  // 재생을 누른 직후나 버퍼링 중에도 true일 수 있어서 따로 둡니다. YouTubePlayer의
  // onStateChange가 채우고, 화면 표시는 lib/playback-display.ts의
  // selectIsAudible/selectIsLoading으로 합칩니다.
  isVideoPlaying: boolean;
  videoOn: boolean;
  volume: number; // 0-100, 새로고침 후에도 유지
  muted: boolean; // 새로고침 후에도 유지
  currentTime: number; // 초 단위, YouTubePlayer가 주기적으로 채워줌
  duration: number; // 초 단위
  pendingSeek: number | null; // PlayerPanel이 요청하고 YouTubePlayer가 처리 후 비움
  // 재생바를 드래그하거나 CD를 돌리는 중인지. 그동안 YouTubePlayer는 0.5초마다 받아오는
  // 실제 재생 시간으로 currentTime을 덮어쓰지 않습니다(손을 따라가던 재생바가 뒤로
  // 튀거나 0.5초 단위로 끊기지 않게).
  isScrubbing: boolean;

  playQueue: (tracks: Track[], startIndex: number, playlistId?: string) => void;
  playTrackFrom: (tracks: Track[], index: number, playlistId?: string) => void;
  playNext: () => void;
  playPrev: () => void;
  jumpTo: (index: number) => void;
  detachCurrentFromPlaylist: () => void;
  setIsPlaying: (playing: boolean) => void;
  setIsVideoPlaying: (playing: boolean) => void;
  setVideoOn: (on: boolean) => void;
  toggleLoopTrack: () => void;
  toggleLoopQueue: () => void;
  toggleShuffle: () => void;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  setProgress: (currentTime: number, duration: number) => void;
  requestSeek: (time: number) => void;
  previewTime: (time: number) => void;
  setIsScrubbing: (scrubbing: boolean) => void;
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
      isVideoPlaying: false,
      videoOn: false,
      volume: 50,
      muted: false,
      currentTime: 0,
      duration: 0,
      pendingSeek: null,
      isScrubbing: false,

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

      // 트랙 목록 행의 재생 버튼(라이브러리/검색 결과/재생목록 상세)이 공유하는 규칙.
      // "지금 재생 중인 곡"은 트랙 id + 재생 맥락(playingPlaylistId, 단일 곡이면 null)을
      // 함께 봅니다.
      // - 같은 곡 + 같은 맥락: 아무것도 안 합니다(일시정지 상태여도 다시 재생하지 않음).
      // - 같은 곡 + 다른 맥락(단일 곡↔재생목록, 재생목록 A↔B): 재생을 끊지 않고
      //   큐/인덱스/재생목록 id만 바꿉니다. currentTime/isPlaying을 건드리지 않고,
      //   현재 곡 id가 그대로라 YouTubePlayer도 영상을 다시 불러오지 않습니다(재생
      //   횟수도 다시 올라가지 않음).
      // - 다른 곡: playQueue와 같이 처음부터 재생합니다.
      playTrackFrom: (tracks, index, playlistId) => {
        const target = tracks[index];
        if (!target) return;
        const { queue, currentIndex, playingPlaylistId } = get();
        const current = currentIndex >= 0 ? queue[currentIndex] : undefined;
        const context = playlistId ?? null;
        if (current?.id === target.id) {
          if (playingPlaylistId === context) return;
          set({ queue: tracks, currentIndex: index, playingPlaylistId: context });
          return;
        }
        get().playQueue(tracks, index, playlistId);
      },

      // 큐의 마지막 곡이 끝났고 반복도 꺼져 있으면(YouTubePlayer의 onEnd) 큐를 비우지
      // 않고 마지막 곡에서 멈춘 상태로 남깁니다 — old-src(Home.js playNext)처럼 재생목록
      // 컨텍스트만 떼어내 그 곡 하나짜리 단일 곡 재생으로 바꾸고(detachCurrentFromPlaylist와
      // 같은 모양), 곡 자체는 CD 플레이어에 그대로 남습니다. YouTube의 ENDED 상태는
      // PAUSED 이벤트를 보내지 않아서 isPlaying도 여기서 직접 false로 내립니다. 다시
      // 재생을 누르면 끝난 영상이 처음부터 재생됩니다. 다음 곡 버튼은 이 경우
      // 비활성화되어 있어서(PlayerPanel) 이 분기는 사실상 곡이 끝났을 때만 탑니다.
      playNext: () => {
        const { queue, currentIndex, loopQueue } = get();
        if (queue.length === 0) return;
        if (currentIndex < queue.length - 1) {
          set({ currentIndex: currentIndex + 1, currentTime: 0, duration: 0 });
        } else if (loopQueue) {
          set({ currentIndex: 0, currentTime: 0, duration: 0 });
        } else {
          set({
            queue: [queue[currentIndex]],
            currentIndex: 0,
            playingPlaylistId: null,
            isPlaying: false,
          });
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
      // (사이드바 "재생 트랙" 목록에서 특정 곡의 재생 버튼을 눌렀을 때). isPlaying을 false로 두는 이유는
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

      // old-src(PlaylistInfo.js)의 playSingle과 같은 역할 — 지금 재생 중인 곡이
      // 자신이 속한 바로 그 재생목록에서 제거될 때, 실제 재생(isPlaying/currentTime)은
      // 끊지 않은 채로 "이 재생목록 소속" 컨텍스트만 떼어내 단독 재생으로 바꿉니다.
      // 큐를 그 곡 하나만 남기는 이유도 old-src와 같습니다 — 더 이상 존재하지 않는
      // 재생목록 순서를 다음/이전 곡 탐색이 계속 참조하지 않도록.
      detachCurrentFromPlaylist: () => {
        const { queue, currentIndex } = get();
        if (currentIndex < 0) return;
        set({
          queue: [queue[currentIndex]],
          currentIndex: 0,
          playingPlaylistId: null,
        });
      },

      setIsPlaying: (playing) => set({ isPlaying: playing }),
      setIsVideoPlaying: (playing) => set({ isVideoPlaying: playing }),
      setVideoOn: (on) => set({ videoOn: on }),
      toggleLoopTrack: () => set((s) => ({ loopTrack: !s.loopTrack })),
      toggleLoopQueue: () => set((s) => ({ loopQueue: !s.loopQueue })),
      toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),
      setVolume: (volume) => set({ volume }),
      setMuted: (muted) => set({ muted }),
      setProgress: (currentTime, duration) => set({ currentTime, duration }),
      // 이동 요청과 동시에 화면의 currentTime도 바로 옮깁니다 — 원래는 YouTube에서
      // 다음 폴링(최대 0.5초 뒤)에 받아올 때까지 재생바가 제자리였습니다.
      requestSeek: (time) => set({ pendingSeek: time, currentTime: time }),
      // YouTube에 이동 요청은 보내지 않고 화면 표시만 옮깁니다(재생바 드래그/CD 스크럽
      // 도중 — 실제 이동 요청은 손을 놓을 때 requestSeek로 한 번).
      previewTime: (time) => set({ currentTime: time }),
      setIsScrubbing: (scrubbing) => set({ isScrubbing: scrubbing }),
      clearPendingSeek: () => set({ pendingSeek: null }),
    }),
    {
      name: "neumorplayer-player-settings",
      // 큐/재생목록 같은 휘발성 상태는 저장하지 않고, 볼륨/음소거처럼 "환경설정"만 유지합니다.
      partialize: (state) => ({ volume: state.volume, muted: state.muted }),
    },
  ),
);
