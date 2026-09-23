import { useMemo, useState } from "react";
import { useYoutubeSearchQuery } from "./useYoutubeSearchQuery";

// 탐색 화면의 검색 입력·쿼리 상태를 모읍니다. 제목/아티스트를 입력하고 "검색"
// 버튼(또는 입력창에서 Enter)을 눌러야 submittedQuery가 바뀌면서 실제 검색이
// 나갑니다(타이핑마다 자동 호출하지 않음). 실제 조회 배선은 랜딩 게스트 검색과
// 공유하는 useYoutubeSearchQuery가 담당합니다. 이전 추가 결과(성공/실패 메시지)를
// 지우는 건 이 훅의 책임이 아니라 호출부(ExplorePage)가 addTrackMutation.reset()을
// 같이 불러서 처리합니다.
export function useExploreSearch() {
  const [titleQuery, setTitleQuery] = useState("");
  const [artistQuery, setArtistQuery] = useState("");
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  const { setSubmittedQuery, hasSearched, results, isFetching, isError } =
    useYoutubeSearchQuery("youtube-search");

  function handleSearch() {
    setSubmittedQuery(`${titleQuery} ${artistQuery}`.trim());
  }

  const selected = useMemo(
    () => results.find((r) => r.videoId === selectedVideoId),
    [results, selectedVideoId],
  );

  return {
    titleQuery,
    setTitleQuery,
    artistQuery,
    setArtistQuery,
    hasSearched,
    handleSearch,
    results,
    isFetching,
    isError,
    selectedVideoId,
    setSelectedVideoId,
    selected,
  };
}
