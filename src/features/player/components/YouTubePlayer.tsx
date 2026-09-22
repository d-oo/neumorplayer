import { useEffect, useRef, useState } from "react";
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
import { tracksQueryKey } from "@/features/library/lib/tracks";
import { useVideoSlot } from "../hooks/useVideoSlot";

const opts: YouTubeProps["opts"] = {
  width: "100%",
  height: "100%",
  playerVars: { autoplay: 1 },
};

// HomeLayout에 항상 마운트해두는 컴포넌트입니다. music/:musicId 라우트를 벗어나도
// 이 컴포넌트 자체는 언마운트되지 않아야 배경 재생이 끊기지 않으므로, 라우트 페이지
// 안에 두지 않고 여기서 화면에 보이는 위치(포탈 대상)만 VideoSlotProvider를 통해
// 바꿔줍니다. 슬롯이 없을 때는 화면 밖 컨테이너에 그대로 둡니다 — display:none을 쓰면
// 일부 브라우저가 숨겨진 iframe의 재생을 스로틀링할 수 있어 화면 밖 배치를 씁니다.
export default function YouTubePlayer() {
  const { slotEl } = useVideoSlot();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [offscreenEl, setOffscreenEl] = useState<HTMLDivElement | null>(null);
  const playerRef = useRef<YouTubePlayerInstance | null>(null);

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
      queryClient.invalidateQueries({ queryKey: ["track", currentTrackId] });
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

  const offscreenAnchor = (
    <div
      ref={setOffscreenEl}
      aria-hidden
      className="fixed left-[-9999px] top-[-9999px] h-px w-px overflow-hidden"
    />
  );

  if (!currentTrack) return offscreenAnchor;

  const target = slotEl ?? offscreenEl;

  const handleReady = (event: YouTubeEvent) => {
    playerRef.current = event.target;
    void event.target.setVolume(volume);
    if (muted) void event.target.mute();
  };

  const handleStateChange = (event: YouTubeEvent<number>) => {
    if (event.data === YouTubeIframe.PlayerState.PLAYING) setIsPlaying(true);
    if (event.data === YouTubeIframe.PlayerState.PAUSED) setIsPlaying(false);
  };

  return (
    <>
      {offscreenAnchor}
      {target &&
        createPortal(
          <YouTubeIframe
            videoId={currentTrack.video_id}
            opts={opts}
            className="h-full w-full"
            iframeClassName="h-full w-full"
            onReady={handleReady}
            onStateChange={handleStateChange}
            onEnd={() => playNext()}
          />,
          target,
        )}
    </>
  );
}
