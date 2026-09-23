import { useMemo, useState } from "react";
import { useYoutubeSearchQuery } from "@/features/explore/lib/useYoutubeSearchQuery";

// 랜딩 페이지의 탐색 카드는 시안대로 단일 검색어 입력이라 제목/아티스트 2필드를
// 조립하는 useExploreSearch(features/explore)는 쓰지 않고, 두 화면이 공유하는
// useYoutubeSearchQuery만 직접 씁니다. 결과는 항상 상위 3건만 보여줍니다(시안 스펙).
export function useLandingSearch() {
  const [query, setQuery] = useState("");
  const [pick, setPick] = useState<string | null>(null);

  const { setSubmittedQuery, hasSearched, results, isFetching, isError } =
    useYoutubeSearchQuery("landing-search");

  function submitSearch() {
    setSubmittedQuery(query.trim());
  }

  function updateQuery(value: string) {
    setQuery(value);
    setPick(null);
  }

  function clearQuery() {
    setQuery("");
    setSubmittedQuery("");
    setPick(null);
  }

  const shown = useMemo(() => results.slice(0, 3), [results]);
  const picked = useMemo(
    () => shown.find((r) => r.videoId === pick),
    [shown, pick],
  );

  return {
    query,
    setQuery: updateQuery,
    clearQuery,
    hasSearched,
    submitSearch,
    shown,
    isFetching,
    isError,
    pick,
    setPick,
    picked,
  };
}
