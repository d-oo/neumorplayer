import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchExploreResults } from "@/features/explore/api/search";

// 랜딩 페이지의 탐색 카드는 시안대로 단일 검색어 입력이라 제목/아티스트 2필드를
// 조립하는 useExploreSearch(features/explore)는 쓰지 않고, fetchExploreResults를
// 직접 호출합니다. 결과는 항상 상위 3건만 보여줍니다(시안 스펙).
export function useLandingSearch() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [pick, setPick] = useState<string | null>(null);

  const hasSearched = submittedQuery !== "";

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

  const {
    data: results = [],
    isFetching,
    isError,
  } = useQuery({
    queryKey: ["landing-search", submittedQuery],
    queryFn: () => fetchExploreResults(submittedQuery),
    enabled: submittedQuery !== "",
  });

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
