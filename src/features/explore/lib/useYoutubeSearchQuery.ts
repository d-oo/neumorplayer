import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchExploreResults } from "@/features/explore/api/search";

// 탐색 화면(useExploreSearch)과 랜딩 게스트 검색(useLandingSearch)이 똑같이 들고
// 있던 "제출된 검색어 → YouTube 검색 결과" 배선만 모은 훅입니다. 입력 필드 구성
// (제목+아티스트 2칸 vs 단일 검색어)과 결과 선택 규칙은 두 화면이 서로 달라서
// 호출부에 그대로 둡니다.
//
// cacheKey를 받는 이유: 두 화면의 캐시를 일부러 분리해 둡니다. 하나로 합치면 같은
// 검색어를 랜딩에서 이미 찾아본 경우 탐색 화면이 로딩 없이 결과를 바로 보여주는
// 등 화면 동작이 달라집니다.
export function useYoutubeSearchQuery(cacheKey: string) {
  const [submittedQuery, setSubmittedQuery] = useState("");

  const {
    data: results = [],
    isFetching,
    isError,
  } = useQuery({
    queryKey: [cacheKey, submittedQuery],
    queryFn: () => fetchExploreResults(submittedQuery),
    enabled: submittedQuery !== "",
  });

  return {
    submittedQuery,
    setSubmittedQuery,
    hasSearched: submittedQuery !== "",
    results,
    isFetching,
    isError,
  };
}
