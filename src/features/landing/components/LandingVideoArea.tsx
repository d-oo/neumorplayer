import YouTubeIframe, { type YouTubeProps } from "react-youtube";
import { PlayIcon } from "@/shared/components/icons";
import type { useGuestPlayer } from "../lib/useGuestPlayer";

const opts: YouTubeProps["opts"] = {
  width: "100%",
  height: "100%",
  // old-src/src/components/YT.js의 playerVars를 그대로 옮겼습니다.
  playerVars: { autoplay: 1, controls: 0, rel: 0, disablekb: 1 },
};

// 528×297 동영상 자리. 재생 중인 곡이 없으면 시안 그대로 정적 플레이스홀더, 검색→선택
// →재생하면 실제 YouTube IFrame이 그 자리에서 재생을 시작합니다(포탈 없음 — 랜딩은
// 페이지 하나뿐이라 배경재생 유지 로직이 필요 없습니다). 528×297은 YouTube API의 최소
// 임베드 뷰포트(200×200px) 요건을 넉넉히 충족합니다.
export default function LandingVideoArea({
  guestPlayer,
}: {
  guestPlayer: ReturnType<typeof useGuestPlayer>;
}) {
  const { track } = guestPlayer;

  if (track) {
    return (
      <div className="h-74.25 w-132 flex-1 overflow-hidden rounded-[20px] border border-(--neu-border-70)">
        <YouTubeIframe
          videoId={track.videoId}
          opts={opts}
          className="h-full w-full"
          iframeClassName="h-full w-full"
          onReady={guestPlayer.onPlayerReady}
          onStateChange={guestPlayer.onPlayerStateChange}
          onEnd={guestPlayer.onPlayerEnd}
        />
      </div>
    );
  }

  return (
    <div
      className="flex h-74.25 w-132 flex-1 flex-col items-center justify-center gap-3.5 rounded-[20px] border border-(--neu-border-70)"
      style={{
        background: "var(--neu-video-placeholder-bg)",
        boxShadow: "var(--neu-shadow-video-placeholder)",
      }}
    >
      <button
        type="button"
        disabled
        aria-label="재생할 영상 없음"
        className="grid h-14.5 w-14.5 place-items-center rounded-full bg-neu-surface opacity-40"
        style={{ boxShadow: "var(--neu-shadow-google)" }}
      >
        <PlayIcon className="ml-0.75 h-4.5 w-4 text-neu-hi" />
      </button>
    </div>
  );
}
