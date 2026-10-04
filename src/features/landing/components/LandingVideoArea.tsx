import { PlayIcon } from "@/shared/components/icons";
import PlaybackIframe from "@/features/player/components/PlaybackIframe";
import type { useGuestPlayer } from "../lib/useGuestPlayer";

// 528×297 동영상 자리. 재생 중인 곡이 없으면 시안 그대로 정적 플레이스홀더, 검색→선택
// →재생하면 실제 YouTube IFrame이 그 자리에서 재생을 시작합니다(포탈 없음 — 랜딩은
// 페이지 하나뿐이라 배경재생 유지 로직이 필요 없습니다). 528×297은 YouTube API의 최소
// 임베드 뷰포트(200×200px) 요건을 넉넉히 충족합니다.
export default function LandingVideoArea({
  guestPlayer,
}: {
  guestPlayer: ReturnType<typeof useGuestPlayer>;
}) {
  const { track, isVideoIdValid } = guestPlayer;

  // 형식이 틀린 video_id면 플레이어를 만들지 않고 플레이스홀더를 그대로 둡니다
  // (useYouTubePlayback의 VIDEO_ID_PATTERN 주석 — 만들면 이후 곡도 재생이 멈춤).
  // 검색 결과의 ID라 실제로는 생기지 않지만 대시보드와 같은 방어를 둡니다.
  if (track && isVideoIdValid) {
    return (
      <div className="h-74.25 w-132 flex-1 overflow-hidden rounded-[20px] border border-(--neu-border-70)">
        <PlaybackIframe
          videoId={track.videoId}
          handlers={guestPlayer.iframeHandlers}
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
