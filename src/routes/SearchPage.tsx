import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { fetchLibraryTracks, tracksQueryKey } from "@/lib/tracks";
import { useDocumentTitle } from "@/lib/useDocumentTitle";
import { formatDuration } from "@/lib/format-time";
import { PlayIcon } from "@/features/player/icons";

type SortKey = "recentAdd" | "title" | "artist" | "playCount";

// SORTS = [["recent","추가순"],["title","제목"],["artist","아티스트"],["plays","재생 횟수"]]
// libDesc 기본값: recent/plays는 내림차순, title/artist는 오름차순 (docs/design/ 그대로).
const SORT_OPTIONS: { key: SortKey; label: string; defaultDesc: boolean }[] = [
  { key: "recentAdd", label: "추가순", defaultDesc: true },
  { key: "title", label: "제목", defaultDesc: false },
  { key: "artist", label: "아티스트", defaultDesc: false },
  { key: "playCount", label: "재생 횟수", defaultDesc: true },
];

const chipStyle = (on: boolean) => ({
  background: on ? "oklch(0.912 0.014 315)" : "oklch(0.935 0.013 315)",
  boxShadow: on
    ? "inset 3px 3px 7px rgba(150,136,175,0.4), inset -3px -3px 6px rgba(255,255,255,0.85)"
    : "4px 4px 10px rgba(142,128,166,0.38), -3px -3px 8px rgba(255,255,255,0.9)",
  borderColor: on ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.8)",
  color: on ? "#6d1a9f" : "oklch(0.34 0.025 315)",
});

// old-src/src/components/SearchMusic.js 를 대체할 자리(라이브러리 목록 + 검색).
// "라이브러리 내 검색" 입력창은 시안대로 헤더(HomeLayout)에 있고, 이 페이지는
// ?q= 쿼리 파라미터로 그 값을 공유받아 필터링만 합니다.
// 행 클릭 = 정보 페이지 이동, 재생은 별도 버튼(사용자가 명시적으로 요청한 흐름) —
// 원본 시안은 행 클릭 자체가 재생이라 이 버튼은 시안엔 없는 추가 요소입니다.
export default function SearchPage() {
  useDocumentTitle("NeumorPlayer");
  const navigate = useNavigate();
  const playQueue = usePlayerStore((s) => s.playQueue);
  const queue = usePlayerStore((s) => s.queue);
  const currentIndex = usePlayerStore((s) => s.currentIndex);
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const {
    data: tracks = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: tracksQueryKey(user?.id),
    queryFn: fetchLibraryTracks,
    enabled: !!user,
  });

  const query = searchParams.get("q") ?? "";
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("recentAdd");
  const [sortDesc, setSortDesc] = useState(true);

  const currentTrackId =
    currentIndex >= 0 ? queue[currentIndex]?.id : undefined;

  const usedTags = useMemo(() => {
    const set = new Set<string>();
    tracks.forEach((t) => t.tags.forEach((tag) => set.add(tag)));
    return Array.from(set);
  }, [tracks]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tracks.filter((t) => {
      if (activeTag && !t.tags.includes(activeTag)) return false;
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.artist.some((a) => a.toLowerCase().includes(q)) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }, [tracks, query, activeTag]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    if (sortKey === "title")
      list.sort((a, b) => a.title.localeCompare(b.title));
    else if (sortKey === "artist")
      list.sort((a, b) => a.artist[0].localeCompare(b.artist[0]));
    else if (sortKey === "playCount")
      list.sort((a, b) => a.play_count - b.play_count);
    // recentAdd: 서버에서 이미 created_at desc로 정렬해 받아오므로 원본 순서를 그대로 씁니다.
    if (sortDesc) list.reverse();
    return list;
  }, [filtered, sortKey, sortDesc]);

  function handleSortClick(key: SortKey, defaultDesc: boolean) {
    if (sortKey === key) setSortDesc((v) => !v);
    else {
      setSortKey(key);
      setSortDesc(defaultDesc);
    }
  }

  return (
    <div>
      <div className="mb-5.5">
        <h1 className="text-[26px] font-extrabold tracking-[-0.035em] text-neu-ink">
          라이브러리
        </h1>
      </div>

      <div className="mb-5.5 flex flex-wrap items-center justify-between gap-4.5">
        <div className="flex min-w-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTag(null)}
            className="whitespace-nowrap rounded-full border px-3.25 py-1.75 text-[12.5px] font-bold"
            style={chipStyle(!activeTag)}
          >
            전체
          </button>
          {usedTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(tag)}
              className="whitespace-nowrap rounded-full border px-3.25 py-1.75 text-[12.5px] font-bold"
              style={chipStyle(activeTag === tag)}
            >
              #{tag}
            </button>
          ))}
        </div>

        <div
          className="flex flex-none gap-0.75 rounded-xl border border-white/70 p-1"
          style={{
            background: "oklch(0.908 0.014 315)",
            boxShadow:
              "inset 3px 3px 7px rgba(150,136,175,0.34), inset -3px -3px 6px rgba(255,255,255,0.85)",
          }}
        >
          {SORT_OPTIONS.map(({ key, label, defaultDesc }) => {
            const isActive = sortKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSortClick(key, defaultDesc)}
                className="flex items-center gap-1.5 whitespace-nowrap rounded-[9px] px-3.25 py-1.75 text-[12.5px] font-bold hover:text-[oklch(0.24_0.025_315)]"
                style={{
                  color: isActive ? "#6d1a9f" : "oklch(0.47 0.025 315)",
                  background: isActive
                    ? "color-mix(in oklab, #b344ff 14%, transparent)"
                    : "transparent",
                  boxShadow: isActive
                    ? "2px 2px 5px rgba(150,136,175,0.34), -2px -2px 4px rgba(255,255,255,0.7)"
                    : "none",
                }}
              >
                {label}
                {isActive && (
                  <svg
                    width="8"
                    height="6"
                    viewBox="0 0 8 6"
                    aria-hidden
                    style={{
                      transform: sortDesc ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  >
                    <polygon points="4,0 8,6 0,6" fill="currentColor" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="grid gap-4 px-3.5 pb-2.5 text-[11px] font-bold tracking-wider text-[oklch(0.47_0.025_315)]"
        style={{
          gridTemplateColumns: "minmax(0,1fr) 190px 74px 46px 28px",
          borderBottom: "1px solid rgba(142,128,166,0.28)",
        }}
      >
        <div>제목</div>
        <div>태그</div>
        <div>재생 횟수</div>
        <div>시간</div>
        <div />
      </div>

      <div className="flex flex-col pt-1.5">
        {sorted.map((track) => {
          const isCurrentTrack = track.id === currentTrackId;
          return (
            <div
              key={track.id}
              onClick={() => navigate(`/music/${track.id}`)}
              className="grid cursor-pointer items-center gap-4 rounded-[11px] px-3.5 py-2.25 hover:bg-[rgba(120,100,145,0.09)]"
              style={{
                gridTemplateColumns: "minmax(0,1fr) 190px 74px 46px 28px",
                background: isCurrentTrack
                  ? "oklch(0.945 0.035 313)"
                  : "transparent",
                boxShadow: isCurrentTrack
                  ? "2px 2px 6px rgba(150,136,175,0.38), -2px -2px 5px rgba(255,255,255,0.8)"
                  : "none",
              }}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div
                  className="h-8.5 w-15 flex-none rounded-md border border-white/70"
                  style={{
                    background:
                      "repeating-linear-gradient(135deg, rgba(118,100,145,0.16) 0 5px, rgba(118,100,145,0.05) 5px 10px), color-mix(in oklab, #b344ff 14%, transparent)",
                    boxShadow:
                      "3px 3px 8px rgba(150,136,175,0.42), -2px -2px 6px rgba(255,255,255,0.92)",
                  }}
                />
                <div className="min-w-0">
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
                  <p className="mt-0.75 truncate text-[12.5px] text-[oklch(0.46_0.025_315)]">
                    {track.artist.join(", ")}
                  </p>
                </div>
              </div>
              <div className="truncate text-xs text-[oklch(0.47_0.025_315)]">
                {track.tags.map((tag) => `#${tag}`).join("  ")}
              </div>
              <div className="font-neu-mono text-[12.5px] text-[oklch(0.47_0.025_315)]">
                {track.play_count.toLocaleString()}
              </div>
              <span className="font-neu-mono text-[12.5px] text-[oklch(0.46_0.025_315)]">
                {formatDuration(track.duration)}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  playQueue([track], 0);
                }}
                aria-label={`${track.title} 재생`}
                className="grid h-7 w-7 place-items-center justify-self-end rounded-full bg-neu-surface text-neu-hi shadow-neu-raised-sm"
              >
                <PlayIcon className="ml-0.5" />
              </button>
            </div>
          );
        })}
      </div>

      {(sorted.length === 0 || isLoading || isError) && (
        <div
          className="mt-3.5 rounded-xl border border-white/70 px-5.5 py-5 text-[13px] text-[oklch(0.47_0.025_315)]"
          style={{
            background: "oklch(0.915 0.014 315)",
            boxShadow:
              "inset 3px 3px 7px rgba(150,136,175,0.34), inset -3px -3px 6px rgba(255,255,255,0.85)",
          }}
        >
          {isLoading
            ? "라이브러리를 불러오는 중..."
            : isError
              ? "라이브러리를 불러오지 못했습니다."
              : "이 태그에 해당하는 곡이 없습니다."}
        </div>
      )}
    </div>
  );
}
