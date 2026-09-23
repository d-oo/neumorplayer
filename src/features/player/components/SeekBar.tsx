import { formatDuration } from "@/shared/lib/format-time";

// 대시보드 PlayerPanel과 랜딩 LandingCdPlayer가 한 글자도 다르지 않은 같은 마크업을
// 각자 들고 있던 재생 진행 바입니다. 드래그 시크의 물리는 useCdPlayerPhysics가
// onPointerDown으로 처리하므로, 여기서는 값만 받아 그립니다.
export default function SeekBar({
  currentTime,
  duration,
  onPointerDown,
}: {
  currentTime: number;
  duration: number;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
}) {
  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8.5 font-neu-mono text-[11px] text-neu-muted">
        {formatDuration(currentTime)}
      </div>
      <div
        onPointerDown={onPointerDown}
        className="flex h-3.5 flex-1 cursor-pointer touch-none select-none items-center"
      >
        <div
          className="flex h-2.25 w-full items-center overflow-hidden rounded-full border border-(--neu-border-60) px-0.5"
          style={{
            background: "var(--neu-ink-905)",
            boxShadow: "var(--neu-shadow-seekbar)",
          }}
        >
          <div
            className="h-1 rounded-full bg-neu-hi"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
      <div className="w-8.5 text-right font-neu-mono text-[11px] text-neu-muted">
        -{formatDuration(Math.max(duration - currentTime, 0))}
      </div>
    </div>
  );
}
