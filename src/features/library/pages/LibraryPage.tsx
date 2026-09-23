import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { usePlayerStore } from "@/features/player/lib/usePlayerStore";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { fetchLibraryTracks, tracksQueryKey } from "../lib/tracks";
import { useDocumentTitle } from "@/shared/lib/useDocumentTitle";
import { formatDuration } from "@/shared/lib/format-time";
import {
  segmentTabClass,
  segmentTabStyle,
} from "@/shared/styles/segment-tab-style";
import { sunkenPanelStyle } from "@/shared/styles/sunken-panel-style";
import { currentTrackRowStyle } from "@/shared/styles/current-track-row-style";
import InfoBox from "@/shared/components/InfoBox";
import TrackRowInfo from "../components/TrackRowInfo";
import IconCircleButton from "@/shared/components/IconCircleButton";
import { PlayIcon, SortArrowIcon } from "@/shared/components/icons";
import MarqueeText from "@/features/player/components/MarqueeText";

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
  background: on ? "var(--neu-ink-912)" : "var(--neu-surface)",
  boxShadow: on ? "var(--neu-shadow-chip-active)" : "var(--neu-shadow-tint-pill)",
  borderColor: on ? "var(--neu-border-70)" : "var(--neu-border-80)",
  color: on ? "var(--neu-hi)" : "var(--neu-ink-34)",
});

// 헤더 행과 각 트랙 행이 같은 컬럼 폭을 써야 해서 한 곳에 둡니다.
const trackRowGridColumns = "minmax(0,1fr) 190px 74px 46px 28px";

// old-src/src/components/SearchMusic.js 를 대체할 자리(라이브러리 목록 + 검색).
// "라이브러리 내 검색" 입력창은 시안대로 헤더(HomeLayout)에 있고, 이 페이지는
// ?q= 쿼리 파라미터로 그 값을 공유받아 필터링만 합니다.
// 행 클릭 = 정보 페이지 이동, 재생은 별도 버튼(사용자가 명시적으로 요청한 흐름) —
// 원본 시안은 행 클릭 자체가 재생이라 이 버튼은 시안엔 없는 추가 요소입니다.
export default function LibraryPage() {
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
    // recentAdd: 서버에서 이미 created_at desc(최신순)로 정렬해 받아오므로, 다른
    // 키들과 달리 원본 순서 자체가 내림차순 기준선입니다 — sortDesc=false(오름차순
    // 선택)일 때만 뒤집어야 합니다.
    if (sortKey === "recentAdd" ? !sortDesc : sortDesc) list.reverse();
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
          className="flex flex-none gap-0.75 rounded-xl border border-(--neu-border-70) p-1"
          style={sunkenPanelStyle}
        >
          {SORT_OPTIONS.map(({ key, label, defaultDesc }) => {
            const isActive = sortKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSortClick(key, defaultDesc)}
                className={`flex items-center gap-1.5 whitespace-nowrap px-3.25 py-1.75 text-[12.5px] ${segmentTabClass(isActive)}`}
                style={segmentTabStyle(isActive)}
              >
                {label}
                {isActive && <SortArrowIcon desc={sortDesc} />}
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="grid gap-4 px-3.5 pb-2.5 text-[11px] font-bold tracking-wider text-neu-muted"
        style={{
          gridTemplateColumns: trackRowGridColumns,
          borderBottom: "1px solid var(--neu-divider)",
        }}
      >
        <div className="pl-18">제목</div>
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
              className="grid cursor-pointer items-center gap-4 rounded-[11px] px-3.5 py-2.25 hover:bg-neu-row-hover"
              style={{
                gridTemplateColumns: trackRowGridColumns,
                ...currentTrackRowStyle(isCurrentTrack),
              }}
            >
              <div className="flex items-center gap-3">
                <TrackRowInfo track={track} isCurrentTrack={isCurrentTrack} />
              </div>
              <MarqueeText
                text={track.tags.map((tag) => `#${tag}`).join("  ")}
                className="text-xs text-neu-muted"
              />
              <div className="font-neu-mono text-[12.5px] text-neu-muted">
                {track.play_count.toLocaleString()}
              </div>
              <span className="font-neu-mono text-[12.5px] text-neu-muted">
                {formatDuration(track.duration)}
              </span>
              <IconCircleButton
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  playQueue([track], 0);
                }}
                aria-label={`${track.title} 재생`}
                className="justify-self-end text-neu-hi shadow-neu-raised-sm"
              >
                <PlayIcon className="ml-0.5" />
              </IconCircleButton>
            </div>
          );
        })}
      </div>

      {(sorted.length === 0 || isLoading || isError) && (
        <InfoBox className="mt-3.5">
          {isLoading
            ? "라이브러리를 불러오는 중..."
            : isError
              ? "라이브러리를 불러오지 못했습니다."
              : "이 태그에 해당하는 곡이 없습니다."}
        </InfoBox>
      )}
    </div>
  );
}
