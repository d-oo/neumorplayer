import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { usePlayerStore } from "@/features/player/lib/usePlayerStore";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { fetchLibraryTracks, tracksQueryKey } from "../lib/tracks";
import { formatDuration } from "@/shared/lib/format-time";
import { currentTrackRowStyle } from "@/shared/styles/current-track-row-style";
import TrackThumbnail from "@/shared/components/TrackThumbnail";
import ThumbBox from "@/shared/components/ThumbBox";
import IconCircleButton from "@/shared/components/IconCircleButton";
import { PlayIcon } from "@/shared/components/icons";

// docs/design/ 시안의 "검색 결과" 화면 — 헤더의 "라이브러리 내 검색"에 뭔가 입력하면
// 지금 보고 있던 탭(라이브러리/탐색) 대신 이 화면이 뜹니다(HomeLayout에서 Outlet 대신
// 이 컴포넌트를 조건부로 렌더링). "태그"/"아티스트" 섹션은 시안에도 클릭 기능이 없어서
// 여기서도 장식(호버 테두리만)이고, 검색어와 무관하게 라이브러리 전체 기준 집계입니다.
// "아티스트" 카드는 시안엔 "이번 달 재생 횟수"지만 스키마에 월별 집계가 없어서
// 대신 전체 기간 재생 횟수 합계를 보여줍니다. "노래" 행은 라이브러리 탭과 같은
// 규칙으로 클릭=정보 페이지 이동, 재생은 별도 버튼입니다(원본은 행 클릭=재생이지만,
// 이건 "라이브러리 내 검색 결과"이므로 라이브러리 탭과 같은 규칙을 따릅니다).
export default function SearchResultsView({ query }: { query: string }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const playQueue = usePlayerStore((s) => s.playQueue);
  const queue = usePlayerStore((s) => s.queue);
  const currentIndex = usePlayerStore((s) => s.currentIndex);
  const currentTrackId =
    currentIndex >= 0 ? queue[currentIndex]?.id : undefined;

  const { data: tracks = [] } = useQuery({
    queryKey: tracksQueryKey(user?.id),
    queryFn: fetchLibraryTracks,
    enabled: !!user,
  });

  const suggestedTags = useMemo(() => {
    const counts = new Map<string, number>();
    tracks.forEach((t) =>
      t.tags.forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1)),
    );
    return Array.from(counts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [tracks]);

  const topArtists = useMemo(() => {
    const totals = new Map<string, number>();
    tracks.forEach((t) =>
      t.artist.forEach((a) =>
        totals.set(a, (totals.get(a) ?? 0) + t.play_count),
      ),
    );
    return Array.from(totals.entries())
      .map(([name, totalPlays]) => ({ name, totalPlays }))
      .sort((a, b) => b.totalPlays - a.totalPlays)
      .slice(0, 4);
  }, [tracks]);

  const q = query.trim().toLowerCase();
  const results = tracks
    .filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.some((a) => a.toLowerCase().includes(q)),
    )
    .slice(0, 4);

  return (
    <div>
      <div className="mb-5 flex items-baseline gap-2.5">
        <h1 className="text-[26px] font-extrabold tracking-[-0.035em] text-neu-ink">
          검색 결과
        </h1>
        <span className="text-[13px] font-semibold text-[oklch(0.46_0.025_315)]">
          &ldquo;{query}&rdquo; · {results.length}건
        </span>
      </div>

      <div className="mb-7.5">
        <div className="mb-3 text-[11.5px] font-bold tracking-[0.06em] text-neu-muted">
          노래
        </div>
        <div className="flex flex-col gap-0.5">
          {results.map((track) => {
            const isCurrentTrack = track.id === currentTrackId;
            return (
              <div
                key={track.id}
                onClick={() => navigate(`/music/${track.id}`)}
                className="flex cursor-pointer items-center gap-3.25 rounded-[11px] px-3 py-2.25 hover:bg-[rgba(120,100,145,0.09)]"
                style={currentTrackRowStyle(isCurrentTrack)}
              >
                <ThumbBox size="rowLg">
                  <TrackThumbnail
                    videoId={track.video_id}
                    className="h-full w-full"
                  />
                </ThumbBox>
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-sm font-semibold"
                    style={{
                      color: isCurrentTrack
                        ? "#6d1a9f"
                        : "oklch(0.3 0.025 315)",
                    }}
                  >
                    {track.title}
                  </p>
                  <p className="mt-0.75 text-[12.5px] text-[oklch(0.46_0.025_315)]">
                    {track.artist.join(", ")}
                  </p>
                </div>
                <span className="font-neu-mono text-[12.5px] text-[oklch(0.46_0.025_315)]">
                  {formatDuration(track.duration)}
                </span>
                <IconCircleButton
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    playQueue([track], 0);
                  }}
                  aria-label={`${track.title} 재생`}
                  className="flex-none text-neu-hi shadow-neu-raised-sm"
                >
                  <PlayIcon className="ml-0.5" />
                </IconCircleButton>
              </div>
            );
          })}
          {results.length === 0 && (
            <p className="px-3 py-2.25 text-sm text-neu-muted">
              일치하는 곡이 없습니다.
            </p>
          )}
        </div>
      </div>

      <div className="mb-3.5 text-[11.5px] font-bold tracking-[0.06em] text-neu-muted">
        태그
      </div>
      <div className="mb-7 flex flex-wrap gap-2.25">
        {suggestedTags.map((tg) => (
          <div
            key={tg.tag}
            className="flex cursor-pointer items-baseline gap-2 rounded-full border border-white/80 px-3.75 py-2.25 transition-colors hover:border-neu-accent-light"
            style={{
              background: "oklch(0.935 0.013 315)",
              boxShadow:
                "5px 5px 12px rgba(142,128,166,0.4), -4px -4px 10px rgba(255,255,255,0.9)",
            }}
          >
            <span className="text-[13.5px] font-bold text-neu-ink">
              #{tg.tag}
            </span>
            <span className="text-xs text-neu-ink opacity-[0.68]">
              {tg.count}곡
            </span>
          </div>
        ))}
      </div>

      <div className="mb-3.5 text-[11.5px] font-bold tracking-[0.06em] text-neu-muted">
        아티스트
      </div>
      <div className="grid grid-cols-4 gap-3.5">
        {topArtists.map((a) => (
          <div
            key={a.name}
            className="cursor-pointer rounded-[14px] border border-white/80 p-4 transition-colors hover:border-neu-accent-light"
            style={{
              background: "oklch(0.935 0.013 315)",
              boxShadow:
                "8px 8px 18px rgba(142,128,166,0.45), -6px -6px 14px rgba(255,255,255,0.9)",
            }}
          >
            <div
              className="mb-3 h-17 w-17 rounded-full border border-white/70"
              style={{
                background:
                  "repeating-linear-gradient(135deg, rgba(118,100,145,0.16) 0 6px, rgba(118,100,145,0.05) 6px 12px), color-mix(in oklab, #b344ff 14%, transparent)",
                boxShadow:
                  "3px 3px 8px rgba(150,136,175,0.42), -2px -2px 6px rgba(255,255,255,0.92)",
              }}
            />
            <p className="truncate text-[13.5px] font-semibold text-neu-ink">
              {a.name}
            </p>
            <p className="mt-1 text-xs text-[oklch(0.46_0.025_315)]">
              {a.totalPlays.toLocaleString()}회 재생
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
