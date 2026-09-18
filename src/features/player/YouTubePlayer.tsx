import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import YouTubeIframe, {
  type YouTubeEvent,
  type YouTubePlayer as YouTubePlayerInstance,
  type YouTubeProps,
} from "react-youtube";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useVideoSlot } from "./useVideoSlot";

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

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    if (isPlaying) void player.playVideo();
    else void player.pauseVideo();
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
