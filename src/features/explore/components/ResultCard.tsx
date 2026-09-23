import { formatDuration } from "@/shared/lib/format-time";
import { thumbnailPlaceholderBackground } from "@/shared/styles/thumbnail-placeholder-style";
import type { ExploreResult } from "@/features/explore/api/search";

// 검색 결과 하나(썸네일+재생시간, 채널 아바타, 제목/채널명/조회수)를 렌더링하는
// 카드. 선택 여부에 따라 sunken(선택됨)/raised(미선택) 그림자로 눌린 느낌을 줍니다.
function getCardStyle(isSelected: boolean) {
  return {
    background: isSelected ? "var(--neu-highlight)" : "var(--neu-surface)",
    boxShadow: isSelected
      ? "var(--neu-shadow-card-sunken)"
      : "var(--neu-shadow-card-raised)",
    borderColor: isSelected ? "var(--neu-border-70)" : "var(--neu-border-80)",
  };
}

export default function ResultCard({
  result,
  isSelected,
  onSelect,
}: {
  result: ExploreResult;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="rounded-[14px] border p-2.5 text-left"
      style={getCardStyle(isSelected)}
    >
      <div
        className="relative aspect-video w-full overflow-hidden rounded-[10px] border border-(--neu-border-70)"
        style={{ boxShadow: "var(--neu-shadow-thumb-inset)" }}
      >
        {result.thumbnailUrl ? (
          <img
            src={result.thumbnailUrl}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        <span className="absolute right-1.75 bottom-1.75 rounded-md bg-[rgba(46,34,62,0.72)] px-1.75 py-0.75 font-neu-mono text-[11px] text-white">
          {formatDuration(result.durationSec)}
        </span>
      </div>
      <div className="mt-2.75 flex gap-2.25">
        <div
          className="h-7.5 w-7.5 flex-none rounded-full border border-(--neu-border-70)"
          style={{
            background: thumbnailPlaceholderBackground,
            boxShadow: "var(--neu-shadow-avatar)",
          }}
        />
        <div className="min-w-0 flex-1">
          <p
            className="line-clamp-2 h-9 text-[13.5px] leading-4.5 font-semibold"
            style={{
              color: isSelected ? "var(--neu-hi)" : "var(--neu-ink)",
            }}
          >
            {result.title}
          </p>
          <p className="mt-0.75 truncate text-xs text-neu-muted">
            {result.channelTitle}
          </p>
          <p className="mt-0.5 truncate text-[11.5px] text-(--neu-ink-55)">
            {result.viewCount.toLocaleString()}회
          </p>
        </div>
      </div>
    </button>
  );
}
