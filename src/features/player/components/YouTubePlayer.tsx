import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useQueryClient } from "@tanstack/react-query";
import { selectCurrentTrack, usePlayerStore } from "../lib/usePlayerStore";
import { findPlayableIndex } from "../lib/queue-navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { supabase } from "@/shared/lib/supabase";
import { useToastStore } from "@/shared/lib/useToastStore";
import { trackQueryKey, tracksQueryKey } from "@/features/library/lib/tracks";
import { useVideoSlot } from "../hooks/useVideoSlot";
import { useYouTubePlayback } from "../hooks/useYouTubePlayback";
import PlaybackIframe from "./PlaybackIframe";

// 미니 플레이어 박스 크기 — MusicInfoPage의 영상 영역(h-51.75 w-92)과 정확히
// 같은 크기라, 도킹된 상태에서 그 자리를 크기 보간 없이 그대로 덮을 수 있습니다.
const BOX_WIDTH = 368;
const BOX_HEIGHT = 207;
const FLOATING_MARGIN = 20;
const TRANSITION_MS = 350;

// HomeLayout에 항상 마운트해두는 컴포넌트입니다. music/:musicId 라우트를 벗어나도
// 이 컴포넌트 자체는 언마운트되지 않아야 배경 재생이 끊기지 않으므로, 실제 iframe은
// document.body에 딱 한 번만 포탈링해두고(포탈 대상 자체를 절대 바꾸지 않습니다 —
// 대상이 바뀌면 그 순간 DOM에서 떨어져 나가 재생이 끊깁니다) 그 박스의 화면 좌표만
// requestAnimationFrame으로 매 프레임 갱신합니다. VideoSlotProvider에 등록된 앵커가
// 있으면(재생 중인 트랙의 MusicInfoPage) 그 앵커의 getBoundingClientRect() 좌표를,
// 없으면 화면 우측 하단 고정 좌표를 목표로 삼습니다 — YouTube API Developer Policies의
// "화면 밖 배경 재생 금지" 요구사항을 항상 만족합니다(재생 중엔 둘 중 어디에 있든
// 실제로 화면에 보임). 도킹 여부가 바뀌는 순간에만 잠깐 CSS transition을 켜서 두 위치
// 사이를 미끄러지듯 이동시키고, 스크롤 등으로 계속 좌표가 바뀌는 동안은 transition을
// 꺼서 버벅임 없이 즉시 따라가게 합니다.
export default function YouTubePlayer() {
  const { anchorEl } = useVideoSlot();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const boxRef = useRef<HTMLDivElement | null>(null);
  const anchorElRef = useRef<HTMLDivElement | null>(anchorEl);
  const wasDockedRef = useRef<boolean | null>(null);
  const transitionTimeoutRef = useRef<number | null>(null);

  const queue = usePlayerStore((s) => s.queue);
  const currentIndex = usePlayerStore((s) => s.currentIndex);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const volume = usePlayerStore((s) => s.volume);
  const muted = usePlayerStore((s) => s.muted);
  const setIsPlaying = usePlayerStore((s) => s.setIsPlaying);
  const setIsVideoPlaying = usePlayerStore((s) => s.setIsVideoPlaying);
  const playNext = usePlayerStore((s) => s.playNext);
  const playPrev = usePlayerStore((s) => s.playPrev);
  const setProgress = usePlayerStore((s) => s.setProgress);
  const pendingSeek = usePlayerStore((s) => s.pendingSeek);
  const clearPendingSeek = usePlayerStore((s) => s.clearPendingSeek);
  const isScrubbing = usePlayerStore((s) => s.isScrubbing);

  const showToast = useToastStore((s) => s.show);

  const currentTrack = selectCurrentTrack({ queue, currentIndex });
  const currentTrackId = currentTrack?.id;

  // 재생 오류로 연달아 건너뛴 곡 수. 실제로 재생이 시작되면(PLAYING) 0으로 돌아갑니다.
  // 반복 재생 중 큐의 곡이 전부 오류를 내면(예: 네트워크 문제로 모든 영상이 실패)
  // 다음 곡 → 오류 → 다음 곡이 끝없이 돌지 않도록, 큐 길이만큼 연달아 실패하면 멈춥니다.
  const consecutiveErrorsRef = useRef(0);

  function handlePlayingChange(playing: boolean) {
    if (playing) consecutiveErrorsRef.current = 0;
    setIsPlaying(playing);
  }

  // YouTube가 재생 오류를 알려오면(DB에서 아직 재생 불가로 표시되기 전에 삭제·비공개된
  // 영상, 퍼가기 금지 영상 등) 이 곡으로 올 때의 방향(navDirection)으로 계속 건너뜁니다 —
  // 다음 곡/곡이 끝나서 왔으면 다음 곡으로, 이전 곡 버튼으로 왔으면 그 앞 곡으로
  // (usePlayerStore.playNext/playPrev와 같은 findPlayableIndex 규칙). 그 방향에 넘어갈
  // 곡이 없으면 그 자리에서 멈춥니다. 어느 쪽이든 토스트로 알려서 곡이 말없이 바뀌지
  // 않게 합니다.
  function handlePlaybackError() {
    // 렌더 시점 값이 아니라 오류가 온 시점의 최신 큐를 봅니다.
    const state = usePlayerStore.getState();
    const failed = selectCurrentTrack(state);
    if (!failed) return;
    consecutiveErrorsRef.current += 1;
    const step = state.navDirection;
    const target = findPlayableIndex(
      state.queue,
      state.currentIndex,
      step,
      state.loopQueue,
    );
    const canSkip =
      target !== -1 &&
      target !== state.currentIndex &&
      consecutiveErrorsRef.current < state.queue.length;
    if (canSkip) {
      showToast(
        `"${failed.title}"을(를) 재생할 수 없어 ${
          step === 1 ? "다음" : "이전"
        } 곡으로 넘어갑니다.`,
      );
      if (step === 1) playNext();
      else playPrev();
    } else {
      consecutiveErrorsRef.current = 0;
      setIsPlaying(false);
      showToast(`"${failed.title}"을(를) 재생할 수 없습니다.`);
    }
  }

  // 재생/일시정지 명령·볼륨·진행 시간 폴링·이동·상태 이벤트·끝남·오류 처리는 랜딩
  // (useGuestPlayer)과 공유하는 useYouTubePlayback이 담당합니다.
  const playback = useYouTubePlayback({
    videoId: currentTrack?.video_id,
    isPlaying,
    volume,
    muted,
    onPlayingChange: handlePlayingChange,
    onVideoPlayingChange: setIsVideoPlaying,
    onProgress: setProgress,
    onEnd: playNext,
    onError: handlePlaybackError,
  });
  const { seek, setScrubbing } = playback;

  // PlayerPanel(물리 훅)이 스토어에 남긴 스크럽 시작/끝을 재생 훅에 전달합니다 —
  // 스크럽 중엔 재생 훅이 폴링 값을 무시합니다.
  useEffect(() => {
    setScrubbing(isScrubbing);
  }, [isScrubbing, setScrubbing]);

  useEffect(() => {
    anchorElRef.current = anchorEl;
  }, [anchorEl]);

  // currentTrack에만 의존합니다(anchorEl 변경마다 effect를 다시 만들지 않고, 이미
  // 돌고 있는 루프가 매 프레임 anchorElRef.current를 읽게 해서 도킹 여부가 바뀌어도
  // 애니메이션 판단(wasDockedRef)이 끊기지 않게 합니다).
  useEffect(() => {
    if (!currentTrackId) return;
    const box = boxRef.current;
    if (!box) return;

    function computeTarget() {
      const anchor = anchorElRef.current;
      // anchor.isConnected를 따로 확인하는 이유: 라우트를 벗어나면 그 문서 노드는
      // React 커밋 시점에 곧바로 DOM에서 제거되지만, anchorElRef는 setAnchorEl(null)의
      // effect가 한 박자 늦게 돌기 전까지 그 "이미 제거된" 노드를 계속 들고 있습니다.
      // 문서에서 떨어져 나간 노드의 getBoundingClientRect()는 전부 0을 반환하므로,
      // 이 확인이 없으면 그 한두 프레임 동안 목표 좌표가 (0,0)이 되어 좌측 상단으로
      // 튀었다가 다시 우측 하단으로 이동하는 것처럼 보입니다.
      if (anchor && anchor.isConnected) {
        const rect = anchor.getBoundingClientRect();
        return { top: rect.top, left: rect.left, docked: true };
      }
      return {
        top: window.innerHeight - FLOATING_MARGIN - BOX_HEIGHT,
        left: window.innerWidth - FLOATING_MARGIN - BOX_WIDTH,
        docked: false,
      };
    }

    // 최초 배치는 어딘가에서 미끄러져 오는 게 아니라 바로 제자리에 나타나야 하므로
    // transition 없이 한 번 스냅합니다.
    const initial = computeTarget();
    box.style.transition = "none";
    box.style.transform = `translate(${initial.left}px, ${initial.top}px)`;
    wasDockedRef.current = initial.docked;

    let rafId: number;
    function tick() {
      const target = computeTarget();
      const current = boxRef.current;
      if (current) {
        if (wasDockedRef.current !== target.docked) {
          current.style.transition = `transform ${TRANSITION_MS}ms cubic-bezier(0.4,0,0.2,1)`;
          if (transitionTimeoutRef.current !== null) {
            window.clearTimeout(transitionTimeoutRef.current);
          }
          transitionTimeoutRef.current = window.setTimeout(() => {
            if (boxRef.current) boxRef.current.style.transition = "none";
          }, TRANSITION_MS + 10);
          wasDockedRef.current = target.docked;
        }
        current.style.transform = `translate(${target.left}px, ${target.top}px)`;
      }
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      if (transitionTimeoutRef.current !== null) {
        window.clearTimeout(transitionTimeoutRef.current);
        transitionTimeoutRef.current = null;
      }
    };
  }, [currentTrackId]);

  // PlayerPanel의 드래그/CD 스크럽이 스토어에 남긴 이동 요청을 YouTube로 보냅니다
  // (화면의 currentTime은 requestSeek가 이미 옮겨 둠).
  useEffect(() => {
    if (pendingSeek === null) return;
    seek(pendingSeek);
    clearPendingSeek();
  }, [pendingSeek, clearPendingSeek, seek]);

  // old-src(Home.js)가 재생 중인 곡이 바뀔 때마다 IndexedDB의 playCount/recentPlay를
  // 갱신하던 것과 같은 지점 — 큐에서 재생 대상이 바뀔 때마다(재생목록 자동 다음곡
  // 포함) 한 번씩 증가시킵니다. 최신 play_count를 다시 읽고 나서 +1 하므로 다른
  // 탭에서 이미 늘어난 값을 덮어쓰지 않습니다(단, 두 값이 동시에 갱신되는 경쟁은
  // 여전히 가능 — 개인용 앱 규모에서는 감수).
  useEffect(() => {
    if (!currentTrackId) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("tracks")
        .select("play_count")
        .eq("id", currentTrackId)
        .single();
      if (cancelled || !data) return;
      await supabase
        .from("tracks")
        .update({
          play_count: data.play_count + 1,
          recent_play: new Date().toISOString(),
        })
        .eq("id", currentTrackId);
      if (cancelled) return;
      queryClient.invalidateQueries({ queryKey: tracksQueryKey(user?.id) });
      queryClient.invalidateQueries({ queryKey: trackQueryKey(currentTrackId) });
    })();
    return () => {
      cancelled = true;
    };
  }, [currentTrackId, queryClient, user?.id]);

  // 형식이 틀린 video_id면 플레이어를 아예 만들지 않습니다 — 만들면 그 뒤 곡들까지
  // 재생이 멈춥니다(useYouTubePlayback의 VIDEO_ID_PATTERN 주석). 오류 처리(다음 곡으로
  // 넘기기/멈춤)는 훅이 handlePlaybackError로 알려줍니다.
  if (!currentTrack || !playback.isVideoIdValid) return null;

  return createPortal(
    <div
      ref={boxRef}
      className="fixed top-0 left-0 z-30 h-51.75 w-92 overflow-hidden rounded-[14px] border border-(--neu-border-80) bg-black"
      style={{ boxShadow: "var(--neu-shadow-media-card)", willChange: "transform" }}
    >
      <PlaybackIframe
        videoId={currentTrack.video_id}
        handlers={playback.iframeHandlers}
      />
    </div>,
    document.body,
  );
}
