import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDuration, parseIsoDuration } from "@/lib/format-time";

interface ExploreResult {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  durationSec: number;
  viewCount: number;
}

interface YoutubeSearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: {
      medium?: { url: string };
      default?: { url: string };
    };
  };
}

interface YoutubeVideoItem {
  id: string;
  contentDetails?: { duration: string };
  statistics?: { viewCount: string };
}

// YouTube Data API는 제목/채널명을 HTML 엔티티로 이스케이프해서 돌려줍니다
// (예: "Guns N' Roses" → "Guns N&#39; Roses") — 화면에 그대로 뿌리면 엔티티가
// 안 풀린 채로 보이니, 브라우저의 HTML 파서를 빌려 디코딩합니다.
function decodeHtmlEntities(text: string): string {
  const el = document.createElement("textarea");
  el.innerHTML = text;
  return el.value;
}

// /api/youtube-search로 후보를 찾고, 그 videoId들을 한 번에 /api/youtube-video에
// 넘겨 재생시간·조회수를 채웁니다(카드마다 따로 요청하지 않도록 배치 조회).
// "앨범"은 YouTube Data API에 없는 개념이라 표시하지 않습니다.
async function fetchExploreResults(query: string): Promise<ExploreResult[]> {
  const searchRes = await fetch(
    `/api/youtube-search?q=${encodeURIComponent(query)}`,
  );
  if (!searchRes.ok) throw new Error("YouTube 검색에 실패했습니다.");
  const searchData: { items?: YoutubeSearchItem[] } = await searchRes.json();
  const items = searchData.items ?? [];
  if (items.length === 0) return [];

  const ids = items.map((item) => item.id.videoId).join(",");
  const videoRes = await fetch(
    `/api/youtube-video?id=${encodeURIComponent(ids)}`,
  );
  if (!videoRes.ok) throw new Error("영상 상세 조회에 실패했습니다.");
  const videoData: { items?: YoutubeVideoItem[] } = await videoRes.json();
  const detailById = new Map(
    (videoData.items ?? []).map((item) => [item.id, item]),
  );

  return items.map((item) => {
    const detail = detailById.get(item.id.videoId);
    return {
      videoId: item.id.videoId,
      title: decodeHtmlEntities(item.snippet.title),
      channelTitle: decodeHtmlEntities(item.snippet.channelTitle),
      thumbnailUrl:
        item.snippet.thumbnails.medium?.url ??
        item.snippet.thumbnails.default?.url ??
        "",
      durationSec: detail?.contentDetails
        ? parseIsoDuration(detail.contentDetails.duration)
        : 0,
      viewCount: detail?.statistics ? Number(detail.statistics.viewCount) : 0,
    };
  });
}

// TODO: 라이브러리에 실제로 존재하는 태그 목록(태그별 곡수 집계)으로 채우세요.
const SUGGESTED_TAGS: { tag: string; count: number }[] = [];

const fieldBoxStyle = {
  background: "oklch(0.915 0.014 315)",
  boxShadow:
    "inset 4px 4px 8px rgba(142,128,166,0.36), inset -3px -3px 7px rgba(255,255,255,0.85)",
};

const avatarStripe =
  "repeating-linear-gradient(135deg, rgba(118,100,145,0.16) 0 4px, rgba(118,100,145,0.05) 4px 8px), color-mix(in oklab, #b344ff 14%, transparent)";

// "검색"/"추가"가 공유하는 알약 모양 CTA 버튼 — docs/design/ 시안의 "추가" 버튼
// 스타일 그대로입니다. 활성 상태일 때만 라벤더 그라디언트 + 보라색 글자로 강조되고,
// 비활성 상태는 눌린 듯한 sunken 그림자로 가라앉습니다.
function PillActionButton({
  label,
  enabled,
  onClick,
}: {
  label: string;
  enabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!enabled}
      className="active:shadow-neu-pill-active rounded-full px-6 py-2.75 text-sm font-bold whitespace-nowrap"
      style={
        enabled
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
      {label}
    </button>
  );
}

// old-src/src/components/AddMusic.js + VideoSearchResult.js가 하던 역할을 이어받는
// 자리. old-src에서는 라이브러리 검색 화면 안의 모달이었지만, docs/product-flow.md에
// 정리된 흐름대로 별도 라우트("탐색")로 분리했습니다. docs/design/ 시안(탐색 화면)의
// 색상·그림자·치수를 그대로 옮겼습니다.
// 제목/아티스트를 입력하고 "검색" 버튼(또는 입력창에서 Enter)을 눌러야 실제로
// /api/youtube-search + /api/youtube-video를 호출합니다(타이핑마다 자동 호출하지
// 않음). "추가" 버튼은 아직 Supabase 연동 전이라 선택 상태만 초기화합니다 —
// tracks 테이블 insert는 docs/todos.md에 남겨둔 후속 작업입니다.
export default function ExplorePage() {
  const [titleQuery, setTitleQuery] = useState("");
  const [artistQuery, setArtistQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const hasSearched = submittedQuery !== "";

  function handleSearch() {
    setSubmittedQuery(`${titleQuery} ${artistQuery}`.trim());
  }

  const {
    data: results = [],
    isFetching,
    isError,
  } = useQuery({
    queryKey: ["youtube-search", submittedQuery],
    queryFn: () => fetchExploreResults(submittedQuery),
    enabled: submittedQuery !== "",
  });

  const selected = useMemo(
    () => results.find((r) => r.videoId === selectedVideoId),
    [results, selectedVideoId],
  );
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
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
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
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              placeholder="예: Mira Vell"
              className="min-w-0 flex-1 bg-transparent text-[13.5px] font-medium text-[oklch(0.25_0.025_315)] outline-none"
            />
          </div>
        </div>
      </div>

      <div className="mb-7 flex justify-end">
        <PillActionButton
          label="검색"
          enabled={titleQuery.trim() !== "" || artistQuery.trim() !== ""}
          onClick={handleSearch}
        />
      </div>

      <div className="mb-3 flex items-baseline gap-2.25">
        <div className="text-[11.5px] font-bold tracking-[0.06em] text-[oklch(0.47_0.025_315)]">
          검색 결과
        </div>
        <div className="text-xs text-[oklch(0.55_0.02_315)]">
          {hasSearched && !isFetching ? `${results.length}건` : ""}
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
                    boxShadow:
                      "inset 2px 2px 5px rgba(146,132,170,0.3), inset -2px -2px 5px rgba(255,255,255,0.7)",
                  }}
                >
                  {r.thumbnailUrl ? (
                    <img
                      src={r.thumbnailUrl}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : null}
                  <span className="absolute right-1.75 bottom-1.75 rounded-md bg-[rgba(46,34,62,0.72)] px-1.75 py-0.75 font-neu-mono text-[11px] text-white">
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
                      className="line-clamp-2 h-9 text-[13.5px] leading-4.5 font-semibold"
                      style={{
                        color: isSelected ? "#6d1a9f" : "oklch(0.3 0.025 315)",
                      }}
                    >
                      {r.title}
                    </p>
                    <p className="mt-0.75 truncate text-xs text-[oklch(0.47_0.025_315)]">
                      {r.channelTitle}
                    </p>
                    <p className="mt-0.5 truncate text-[11.5px] text-[oklch(0.55_0.02_315)]">
                      {r.viewCount.toLocaleString()}회
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
          {isFetching
            ? "검색 중..."
            : isError
              ? "검색 중 오류가 발생했습니다."
              : hasSearched
                ? "일치하는 곡이 없습니다."
                : "아티스트나 제목을 입력하고 검색을 눌러주세요."}
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
          className="active:shadow-neu-sunken rounded-full border border-white/80 bg-neu-surface px-4 py-2.25 text-[13px] font-bold whitespace-nowrap"
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
        <PillActionButton label="추가" enabled={!!selected} onClick={handleAdd} />
      </div>
    </div>
  );
}
