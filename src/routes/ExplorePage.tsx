import { useMemo, useState } from "react";
import { formatDuration } from "@/lib/format-time";

interface ExploreResult {
  videoId: string;
  title: string;
  artist: string;
  album: string;
  durationSec: number;
  viewCount: number;
}

// TODO: /api/youtube-search 호출 결과로 채우세요.
const EXPLORE_SEARCH_POOL: ExploreResult[] = [];

// TODO: 라이브러리에 실제로 존재하는 태그 목록(태그별 곡수 집계)으로 채우세요.
const SUGGESTED_TAGS: { tag: string; count: number }[] = [];

const fieldBoxStyle = {
  background: "oklch(0.915 0.014 315)",
  boxShadow:
    "inset 4px 4px 8px rgba(142,128,166,0.36), inset -3px -3px 7px rgba(255,255,255,0.85)",
};

const thumbStripe =
  "repeating-linear-gradient(135deg, rgba(118,100,145,0.16) 0 6px, rgba(118,100,145,0.05) 6px 12px), color-mix(in oklab, #b344ff 14%, transparent)";
const avatarStripe =
  "repeating-linear-gradient(135deg, rgba(118,100,145,0.16) 0 4px, rgba(118,100,145,0.05) 4px 8px), color-mix(in oklab, #b344ff 14%, transparent)";

// old-src/src/components/AddMusic.js + VideoSearchResult.js가 하던 역할을 이어받는
// 자리. old-src에서는 라이브러리 검색 화면 안의 모달이었지만, docs/product-flow.md에
// 정리된 흐름대로 별도 라우트("탐색")로 분리했습니다. docs/design/ 시안(탐색 화면)의
// 색상·그림자·치수를 그대로 옮겼습니다.
// TODO: 실제로는 제목/아티스트 입력 → /api/youtube-search 호출 → 결과 카드 → 태그
// 선택 → /api/youtube-video로 상세 조회 후 tracks 테이블에 insert(라이브러리에 추가).
export default function ExplorePage() {
  const [titleQuery, setTitleQuery] = useState("");
  const [artistQuery, setArtistQuery] = useState("");
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const hasQuery = titleQuery.trim() !== "" || artistQuery.trim() !== "";

  const results = useMemo(() => {
    if (!hasQuery) return [];
    const t = titleQuery.trim().toLowerCase();
    const a = artistQuery.trim().toLowerCase();
    return EXPLORE_SEARCH_POOL.filter((r) => {
      if (t && !r.title.toLowerCase().includes(t)) return false;
      if (a && !r.artist.toLowerCase().includes(a)) return false;
      return true;
    }).slice(0, 6);
  }, [hasQuery, titleQuery, artistQuery]);

  const selected = results.find((r) => r.videoId === selectedVideoId);
  const allTags = [...SUGGESTED_TAGS.map((t) => t.tag), ...customTags];

  function toggleTag(tag: string) {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }

  function handleAddTagInput() {
    const tag = tagInput.trim().replace(/^#+/, "");
    if (!tag) return;
    if (!allTags.includes(tag)) setCustomTags((prev) => [...prev, tag]);
    setSelectedTags((prev) => new Set(prev).add(tag));
    setTagInput("");
  }

  function handleAdd() {
    if (!selected) return;
    setSelectedVideoId(null);
    setSelectedTags(new Set());
  }

  return (
    <div>
      <h1 className="mb-1.75 text-[26px] font-extrabold tracking-[-0.035em] text-neu-ink">
        탐색
      </h1>
      <p className="mb-6.5 text-[13px] text-[oklch(0.46_0.025_315)]">
        아티스트와 제목으로 찾아 라이브러리에 추가합니다.
      </p>

      <div className="mb-7 grid grid-cols-2 gap-3.5">
        <div>
          <div className="mb-2.25 text-[11.5px] font-bold tracking-[0.06em] text-[oklch(0.47_0.025_315)]">
            제목
          </div>
          <div
            className="flex items-center rounded-[11px] border border-white/80 px-3.5 py-2.5"
            style={fieldBoxStyle}
          >
            <input
              value={titleQuery}
              onChange={(e) => setTitleQuery(e.target.value)}
              placeholder="예: Bloom"
              className="min-w-0 flex-1 bg-transparent text-[13.5px] font-medium text-[oklch(0.25_0.025_315)] outline-none"
            />
          </div>
        </div>
        <div>
          <div className="mb-2.25 text-[11.5px] font-bold tracking-[0.06em] text-[oklch(0.47_0.025_315)]">
            아티스트
          </div>
          <div
            className="flex items-center rounded-[11px] border border-white/80 px-3.5 py-2.5"
            style={fieldBoxStyle}
          >
            <input
              value={artistQuery}
              onChange={(e) => setArtistQuery(e.target.value)}
              placeholder="예: Mira Vell"
              className="min-w-0 flex-1 bg-transparent text-[13.5px] font-medium text-[oklch(0.25_0.025_315)] outline-none"
            />
          </div>
        </div>
      </div>

      <div className="mb-3 flex items-baseline gap-2.25">
        <div className="text-[11.5px] font-bold tracking-[0.06em] text-[oklch(0.47_0.025_315)]">
          검색 결과
        </div>
        <div className="text-xs text-[oklch(0.55_0.02_315)]">
          {hasQuery ? `${results.length}건` : ""}
        </div>
      </div>

      {results.length > 0 ? (
        <div className="mb-7 grid grid-cols-3 gap-4">
          {results.map((r) => {
            const isSelected = r.videoId === selectedVideoId;
            return (
              <button
                key={r.videoId}
                type="button"
                onClick={() => setSelectedVideoId(r.videoId)}
                className="rounded-[14px] border p-2.5 text-left"
                style={{
                  background: isSelected
                    ? "oklch(0.945 0.035 313)"
                    : "oklch(0.935 0.013 315)",
                  boxShadow: isSelected
                    ? "inset 5px 5px 11px rgba(150,136,175,0.45), inset -4px -4px 9px rgba(255,255,255,0.9)"
                    : "8px 8px 18px rgba(142,128,166,0.45), -6px -6px 14px rgba(255,255,255,0.9)",
                  borderColor: isSelected
                    ? "rgba(255,255,255,0.7)"
                    : "rgba(255,255,255,0.8)",
                }}
              >
                <div
                  className="relative aspect-video w-full overflow-hidden rounded-[10px] border border-white/70"
                  style={{
                    background: thumbStripe,
                    boxShadow:
                      "inset 2px 2px 5px rgba(146,132,170,0.3), inset -2px -2px 5px rgba(255,255,255,0.7)",
                  }}
                >
                  <span className="absolute bottom-1.75 right-1.75 rounded-md bg-[rgba(46,34,62,0.72)] px-1.75 py-0.75 font-neu-mono text-[11px] text-white">
                    {formatDuration(r.durationSec)}
                  </span>
                </div>
                <div className="mt-2.75 flex gap-2.25">
                  <div
                    className="h-7.5 w-7.5 flex-none rounded-full border border-white/70"
                    style={{
                      background: avatarStripe,
                      boxShadow:
                        "2px 2px 6px rgba(150,136,175,0.4), -2px -2px 5px rgba(255,255,255,0.9)",
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className="line-clamp-2 h-9 text-[13.5px] font-semibold leading-4.5"
                      style={{
                        color: isSelected ? "#6d1a9f" : "oklch(0.3 0.025 315)",
                      }}
                    >
                      {r.title}
                    </p>
                    <p className="mt-0.75 truncate text-xs text-[oklch(0.47_0.025_315)]">
                      {r.artist}
                    </p>
                    <p className="mt-0.5 truncate text-[11.5px] text-[oklch(0.55_0.02_315)]">
                      {r.viewCount.toLocaleString()}회 · {r.album}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div
          className="mb-7 rounded-xl border border-white/70 px-5.5 py-5 text-[13px] text-[oklch(0.47_0.025_315)]"
          style={{
            background: "oklch(0.915 0.014 315)",
            boxShadow:
              "inset 3px 3px 7px rgba(150,136,175,0.34), inset -3px -3px 6px rgba(255,255,255,0.85)",
          }}
        >
          {hasQuery
            ? "일치하는 곡이 없습니다."
            : "아티스트나 제목을 입력하면 결과가 표시됩니다."}
        </div>
      )}

      <div className="mb-3.5 text-[11.5px] font-bold tracking-[0.06em] text-[oklch(0.47_0.025_315)]">
        태그
      </div>
      <div className="mb-3 flex items-center gap-2.25">
        <div
          className="flex w-60 items-center gap-2 rounded-full border border-white/80 px-3.75 py-2.25"
          style={fieldBoxStyle}
        >
          <span className="flex-none text-[13.5px] font-bold text-[oklch(0.55_0.02_315)]">
            #
          </span>
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTagInput();
              }
            }}
            placeholder="태그 직접 입력"
            className="min-w-0 flex-1 bg-transparent text-[13px] font-semibold text-[oklch(0.25_0.025_315)] outline-none"
          />
        </div>
        <button
          type="button"
          onClick={handleAddTagInput}
          className="whitespace-nowrap rounded-full border border-white/80 bg-neu-surface px-4 py-2.25 text-[13px] font-bold active:shadow-neu-sunken"
          style={{
            boxShadow:
              "4px 4px 10px rgba(142,128,166,0.38), -3px -3px 8px rgba(255,255,255,0.9)",
            color: tagInput.trim() ? "#6d1a9f" : "oklch(0.58 0.02 315)",
            cursor: tagInput.trim() ? "pointer" : "default",
          }}
        >
          태그 추가
        </button>
      </div>

      <div className="mb-7 flex flex-wrap gap-2.25">
        {allTags.map((tag) => {
          const isOn = selectedTags.has(tag);
          const count = SUGGESTED_TAGS.find((t) => t.tag === tag)?.count;
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className="flex items-baseline gap-2 rounded-full border px-3.75 py-2.25"
              style={{
                background: isOn
                  ? "oklch(0.912 0.014 315)"
                  : "oklch(0.935 0.013 315)",
                boxShadow: isOn
                  ? "inset 3px 3px 7px rgba(150,136,175,0.4), inset -3px -3px 6px rgba(255,255,255,0.85)"
                  : "5px 5px 12px rgba(142,128,166,0.4), -4px -4px 10px rgba(255,255,255,0.9)",
                borderColor: isOn
                  ? "rgba(255,255,255,0.7)"
                  : "rgba(255,255,255,0.8)",
                color: isOn ? "#6d1a9f" : "oklch(0.3 0.025 315)",
              }}
            >
              <span className="text-[13.5px] font-bold">#{tag}</span>
              {count !== undefined && (
                <span className="text-xs opacity-[0.68]">{count}곡</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleAdd}
          disabled={!selected}
          className="whitespace-nowrap rounded-full px-6 py-2.75 text-sm font-bold active:shadow-neu-pill-active"
          style={
            selected
              ? {
                  background:
                    "linear-gradient(155deg, oklch(0.94 0.038 312), oklch(0.885 0.055 312))",
                  color: "#6d1a9f",
                  boxShadow:
                    "7px 7px 16px rgba(138,110,172,0.55), -5px -5px 13px rgba(255,255,255,0.95), inset 0 1px 0 rgba(255,255,255,0.65)",
                  cursor: "pointer",
                }
              : {
                  background: "oklch(0.928 0.013 315)",
                  color: "oklch(0.58 0.02 315)",
                  boxShadow:
                    "inset 3px 3px 7px rgba(150,136,175,0.3), inset -3px -3px 6px rgba(255,255,255,0.8)",
                  cursor: "default",
                }
          }
        >
          추가
        </button>
      </div>
    </div>
  );
}
