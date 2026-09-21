import { formatDuration } from "@/shared/lib/format-time";
import { thumbnailPlaceholderBackground } from "@/shared/styles/thumbnail-placeholder-style";
import type { ExploreResult } from "@/features/explore/api/search";

// 검색 결과 하나(썸네일+재생시간, 채널 아바타, 제목/채널명/조회수)를 렌더링하는
// 카드. 선택 여부에 따라 sunken(선택됨)/raised(미선택) 그림자로 눌린 느낌을 줍니다.
function getCardStyle(isSelected: boolean) {
  return {
    background: isSelected ? "oklch(0.945 0.035 313)" : "oklch(0.935 0.013 315)",
    boxShadow: isSelected
      ? "inset 5px 5px 11px rgba(150,136,175,0.45), inset -4px -4px 9px rgba(255,255,255,0.9)"
      : "8px 8px 18px rgba(142,128,166,0.45), -6px -6px 14px rgba(255,255,255,0.9)",
    borderColor: isSelected ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.8)",
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
        className="relative aspect-video w-full overflow-hidden rounded-[10px] border border-white/70"
        style={{
          boxShadow:
            "inset 2px 2px 5px rgba(146,132,170,0.3), inset -2px -2px 5px rgba(255,255,255,0.7)",
        }}
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
          className="h-7.5 w-7.5 flex-none rounded-full border border-white/70"
          style={{
            background: thumbnailPlaceholderBackground,
            boxShadow:
              "2px 2px 6px rgba(150,136,175,0.4), -2px -2px 5px rgba(255,255,255,0.9)",
          }}
        />
        <div className="min-w-0 flex-1">
          <p
            className="line-clamp-2 h-9 text-[13.5px] leading-4.5 font-semibold"
            style={{
              color: isSelected ? "#6d1a9f" : "oklch(0.3 0.025 315)",
            }}
          >
            {result.title}
          </p>
          <p className="mt-0.75 truncate text-xs text-neu-muted">
            {result.channelTitle}
          </p>
          <p className="mt-0.5 truncate text-[11.5px] text-[oklch(0.55_0.02_315)]">
            {result.viewCount.toLocaleString()}회
          </p>
        </div>
      </div>
    </button>
  );
}
