import { useState } from "react";
import type { Track } from "../lib/tracks";
import { useLibraryTracks } from "../hooks/useLibraryTracks";
import {
  segmentTabClass,
  segmentTabStyle,
} from "@/shared/styles/segment-tab-style";
import { sunkenPanelStyle } from "@/shared/styles/sunken-panel-style";
import MutedNote from "@/shared/components/MutedNote";
import PageTitle from "@/shared/components/PageTitle";
import LibraryTrackList from "./LibraryTrackList";

// 검색어가 들어간 값(아티스트명/태그)이 같은 곡끼리 모이도록 정렬해서 돌려줍니다.
// 그룹 순서는 그 값의 곡이 원래 목록(추가순)에 처음 나온 순서, 그룹 안은 원래 순서
// 그대로입니다. 한 곡에 검색어가 들어간 값이 여럿이면(예: 아티스트 두 명이 모두
// 검색어 포함) 탭 안에서 중복되지 않도록 첫 번째 값의 그룹에만 넣습니다. 대소문자만
// 다른 값("Dean"/"dean")은 같은 그룹으로 봅니다.
function matchGroupedByValue(
  tracks: Track[],
  getValues: (t: Track) => string[],
  q: string,
): Track[] {
  const groupOrder = new Map<string, number>();
  const matched: { track: Track; group: number }[] = [];
  tracks.forEach((track) => {
    const value = getValues(track).find((v) => v.toLowerCase().includes(q));
    if (value === undefined) return;
    const key = value.toLowerCase();
    let group = groupOrder.get(key);
    if (group === undefined) {
      group = groupOrder.size;
      groupOrder.set(key, group);
    }
    matched.push({ track, group });
  });
  // Array.prototype.sort는 안정 정렬이라 같은 그룹 안에서는 원래 순서가 유지됩니다.
  return matched.sort((a, b) => a.group - b.group).map((m) => m.track);
}

type ResultTab = "title" | "artist" | "tag";

const RESULT_TABS: { key: ResultTab; label: string }[] = [
  { key: "title", label: "제목" },
  { key: "artist", label: "아티스트" },
  { key: "tag", label: "태그" },
];

// docs/design/ 시안의 "검색 결과" 화면 — 헤더의 "라이브러리 내 검색"에 뭔가 입력하면
// 지금 보고 있던 탭(라이브러리/탐색) 대신 이 화면이 뜹니다(HomeLayout에서 Outlet 대신
// 이 컴포넌트를 조건부로 렌더링). 시안의 "노래/태그/아티스트"(태그 칩·아티스트 카드는
// 검색어와 무관한 라이브러리 전체 집계) 구성 대신, 사용자 요청으로 "제목/아티스트/태그"
// 세 탭 모두 해당 필드에 검색어가 들어간 곡 목록을 보여줍니다(예: "d" → 제목엔
// dangerously, 아티스트엔 dean의 곡들, 태그엔 #drive 곡들). 한 곡이 여러 탭에 걸리면
// 탭마다 다 보여주고, 개수 제한 없이 전부 보여줍니다. 세 탭 모두 라이브러리 탭과
// 모습·규칙이 완전히 같도록(사용자 요청) 같은 LibraryTrackList(열 제목 헤더 + 트랙 행)를
// 씁니다 — 클릭=정보 페이지 이동, 재생은 hover 때 재생시간 자리의 버튼(원본은 행
// 클릭=재생이지만, 이건 "라이브러리 내 검색 결과"이므로 라이브러리 탭 규칙을 따름).
// 예전엔 세 섹션을 위아래로 나열했지만 사용자 요청으로 탭으로 바꿨습니다. 탭 모양은
// 라이브러리의 정렬 탭과 같은 세그먼트 탭이고, 새로 검색하면 항상 "제목"부터 시작합니다 —
// 검색어를 지웠다가 다시 검색하면 이 화면이 새로 마운트되고, 결과 화면을 연 채로 다른
// 검색어를 커밋하면 아래에서 탭을 되돌립니다(useLibrarySearchQuery와 같은 "prop 변경 시
// 상태 조정" 패턴). 같은 검색어로 다시 엔터를 치면 query가 그대로라 탭도 유지됩니다.
export default function SearchResultsView({ query }: { query: string }) {
  const [activeTab, setActiveTab] = useState<ResultTab>("title");
  const [tabQuery, setTabQuery] = useState(query);
  if (query !== tabQuery) {
    setTabQuery(query);
    setActiveTab("title");
  }

  const { data: tracks = [] } = useLibraryTracks();

  const q = query.trim().toLowerCase();
  const results =
    activeTab === "title"
      ? tracks.filter((t) => t.title.toLowerCase().includes(q))
      : activeTab === "artist"
        ? matchGroupedByValue(tracks, (t) => t.artist, q)
        : matchGroupedByValue(tracks, (t) => t.tags, q);

  return (
    <div>
      <div className="mb-5 flex items-baseline gap-2.5">
        <PageTitle>검색 결과</PageTitle>
        <span className="text-[13px] font-semibold text-neu-muted">
          &ldquo;{query}&rdquo;
        </span>
      </div>

      <div
        className="mb-5.5 flex w-fit gap-0.75 rounded-xl border border-(--neu-border-70) p-1"
        style={sunkenPanelStyle}
      >
        {RESULT_TABS.map(({ key, label }) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`whitespace-nowrap px-3.25 py-1.75 text-[12.5px] ${segmentTabClass(isActive)}`}
              style={segmentTabStyle(isActive)}
            >
              {label}
            </button>
          );
        })}
      </div>

      <LibraryTrackList tracks={results} />
      {results.length === 0 && (
        <MutedNote className="px-3.5 py-2.25">일치하는 곡이 없습니다.</MutedNote>
      )}
    </div>
  );
}
