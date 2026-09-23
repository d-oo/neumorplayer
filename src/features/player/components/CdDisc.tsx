import type { RefObject } from "react";
import { PauseIcon, PlayIcon } from "@/shared/components/icons";
import TrackThumbnail from "@/shared/components/TrackThumbnail";

// PlayerPanel.tsx에서 분리한 순수 프리젠테이션 조각입니다(그라디언트 스택·허브·
// 재생버튼 마크업은 그대로, 상태 없음). 회전 자체는 useCdPlayerPhysics가 discRef의
// style.transform을 리렌더 없이 직접 조작하므로, 이 컴포넌트는 transform을 지정하지
// 않습니다. videoId가 있으면 TrackThumbnail(shared, 실패 시 스트라이프 placeholder로
// 자동 대체)을 디스크 맨 밑에 깔고, 원래 그라디언트 스택(홈/그루브/광택/틴트)은 트랙
// 없이도 있던 그대로 반투명 오버레이로 위에 얹어 "이미지 위에 CD 질감이 비치는"
// 느낌을 냅니다 — 불투명했던 마지막 베이스 색(oklch(0.905 0.014 315))만 이미지를
// 완전히 가리지 않도록 바깥 div의 기본 배경(트랙 없을 때의 폴백)으로 옮겼습니다.
export default function CdDisc({
  discRef,
  onPointerDown,
  isPlaying,
  hasTrack,
  videoId,
  onTogglePlayClick,
}: {
  discRef: RefObject<HTMLDivElement | null>;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  isPlaying: boolean;
  hasTrack: boolean;
  videoId?: string;
  onTogglePlayClick: () => void;
}) {
  return (
    <div className="relative h-41.5 w-41.5 flex-none">
      <div
        ref={discRef}
        onPointerDown={onPointerDown}
        className="absolute inset-0 cursor-grab touch-none select-none overflow-hidden rounded-full active:cursor-grabbing"
        style={{
          background: "oklch(0.905 0.014 315)",
          boxShadow:
            "7px 7px 16px rgba(146,132,170,0.5), -6px -6px 14px rgba(255,255,255,0.95)",
        }}
      >
        {videoId && (
          <TrackThumbnail
            videoId={videoId}
            className="absolute inset-0 h-full w-full"
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, var(--neu-surface) 0 28px, transparent 28px 30px), repeating-radial-gradient(circle at 50% 50%, rgba(126,110,156,0.13) 0 1px, rgba(255,255,255,0) 1px 3px), linear-gradient(150deg, rgba(179,68,255,0.14), transparent 70%)",
          }}
        />
        {/* 광택(빛반사) 레이어만 따로 분리 — 썸네일이 있으면 이미지를 뿌옇게 덮지
            않도록 세기를 낮춥니다(트랙 없을 때는 시안 원래 세기 그대로). */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "conic-gradient(from 210deg, rgba(255,255,255,0.85), rgba(255,255,255,0) 22%, rgba(255,255,255,0.6) 48%, rgba(255,255,255,0) 72%, rgba(255,255,255,0.85))",
            opacity: videoId ? 0.4 : 1,
          }}
        />
        <div
          className="absolute left-1/2 top-1/2 h-25.5 w-25.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            boxShadow:
              "inset 2px 2px 5px rgba(146,132,170,0.4), inset -2px -2px 5px rgba(255,255,255,0.9)",
          }}
        />
        <div
          className="absolute left-1/2 top-1/2 h-15 w-15 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "linear-gradient(150deg, rgba(179,68,255,0.16), rgba(255,255,255,0.5) 72%)",
            boxShadow:
              "inset 3px 3px 7px rgba(146,132,170,0.45), inset -3px -3px 7px rgba(255,255,255,0.95)",
          }}
        />
      </div>

      <div
        className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-neu-surface"
        style={{
          boxShadow:
            "5px 5px 12px rgba(146,132,170,0.5), -4px -4px 10px rgba(255,255,255,0.95)",
        }}
      >
        <button
          type="button"
          onClick={onTogglePlayClick}
          disabled={!hasTrack}
          aria-label={isPlaying ? "일시정지" : "재생"}
          className="grid h-9.5 w-9.5 place-items-center rounded-full bg-neu-surface text-neu-hi transition-shadow hover:text-[oklch(0.32_0.14_305)] active:shadow-neu-sunken disabled:opacity-40"
          style={{
            boxShadow:
              "4px 4px 9px rgba(146,132,170,0.5), -3px -3px 8px rgba(255,255,255,0.95)",
          }}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon className="ml-0.5" />}
        </button>
      </div>
    </div>
  );
}
