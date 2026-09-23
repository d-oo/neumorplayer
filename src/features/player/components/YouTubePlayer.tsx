import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import YouTubeIframe, {
  type YouTubeEvent,
  type YouTubePlayer as YouTubePlayerInstance,
  type YouTubeProps,
} from "react-youtube";
import { useQueryClient } from "@tanstack/react-query";
import { usePlayerStore } from "../lib/usePlayerStore";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { supabase } from "@/shared/lib/supabase";
import { trackQueryKey, tracksQueryKey } from "@/features/library/lib/tracks";
import { useVideoSlot } from "../hooks/useVideoSlot";

const opts: YouTubeProps["opts"] = {
  width: "100%",
  height: "100%",
  // old-src/src/components/YT.js의 playerVars를 그대로 옮겼습니다.
  playerVars: { autoplay: 1, controls: 0, rel: 0, disablekb: 1 },
};

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
  const playerRef = useRef<YouTubePlayerInstance | null>(null);
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
  const playNext = usePlayerStore((s) => s.playNext);
  const setProgress = usePlayerStore((s) => s.setProgress);
  const pendingSeek = usePlayerStore((s) => s.pendingSeek);
  const clearPendingSeek = usePlayerStore((s) => s.clearPendingSeek);

  const currentTrack = currentIndex >= 0 ? queue[currentIndex] : undefined;
  const currentTrackId = currentTrack?.id;
  const prevTrackIdRef = useRef<string | undefined>(undefined);

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

  useEffect(() => {
    const player = playerRef.current;
    const trackChanged = prevTrackIdRef.current !== currentTrackId;
    prevTrackIdRef.current = currentTrackId;
    if (!player) return;
    if (isPlaying) {
      void player.playVideo();
    } else if (!trackChanged) {
      // 트랙이 바뀌는 시점의 isPlaying:false는 "아직 실제 재생 전"이라는 뜻이지
      // "일시정지하라"는 뜻이 아닙니다(usePlayerStore.playQueue/jumpTo 참고) — 여기서
      // pauseVideo를 부르면 막 자동재생을 시작한 영상을 바로 멈춰버립니다. 같은
      // 트랙에서 사용자가 실제로 일시정지를 눌렀을 때만(trackChanged가 false) 멈춥니다.
      void player.pauseVideo();
    }
  }, [isPlaying, currentTrackId]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    void player.setVolume(volume);
    if (muted) void player.mute();
    else void player.unMute();
  }, [volume, muted]);

  useEffect(() => {
    if (pendingSeek === null) return;
    const player = playerRef.current;
    if (player) void player.seekTo(pendingSeek, true);
    clearPendingSeek();
  }, [pendingSeek, clearPendingSeek]);

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

  useEffect(() => {
    if (!currentTrackId) return;
    // playerRef는 컴포넌트가 처음 마운트될 때 한 번(onReady)만 채워지고, 곡이
    // 바뀌어도 같은 인스턴스가 재사용되므로 매 tick마다 다시 읽어야 합니다
    // (effect 설정 시점엔 아직 준비 전일 수 있음).
    const interval = window.setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      Promise.all([player.getCurrentTime(), player.getDuration()]).then(
        ([currentTime, duration]) => setProgress(currentTime, duration),
      );
    }, 500);
    return () => window.clearInterval(interval);
  }, [currentTrackId, setProgress]);

  if (!currentTrack) return null;

  const handleReady = (event: YouTubeEvent) => {
    playerRef.current = event.target;
    void event.target.setVolume(volume);
    if (muted) void event.target.mute();
  };

  const handleStateChange = (event: YouTubeEvent<number>) => {
    if (event.data === YouTubeIframe.PlayerState.PLAYING) setIsPlaying(true);
    if (event.data === YouTubeIframe.PlayerState.PAUSED) setIsPlaying(false);
  };

  return createPortal(
    <div
      ref={boxRef}
      className="fixed top-0 left-0 z-30 h-51.75 w-92 overflow-hidden rounded-[14px] border border-(--neu-border-80) bg-black"
      style={{ boxShadow: "var(--neu-shadow-media-card)", willChange: "transform" }}
    >
      <YouTubeIframe
        videoId={currentTrack.video_id}
        opts={opts}
        className="h-full w-full"
        iframeClassName="h-full w-full"
        onReady={handleReady}
        onStateChange={handleStateChange}
        onEnd={() => playNext()}
      />
    </div>,
    document.body,
  );
}
