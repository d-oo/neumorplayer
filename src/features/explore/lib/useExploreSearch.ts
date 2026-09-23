import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchExploreResultByVideoId } from "@/features/explore/api/search";
import { useYoutubeSearchQuery } from "./useYoutubeSearchQuery";

// 탐색 화면의 검색 입력·쿼리 상태를 모읍니다. 제목/아티스트를 입력하고 "검색"
// 버튼(또는 입력창에서 Enter)을 눌러야 submittedQuery가 바뀌면서 실제 검색이
// 나갑니다(타이핑마다 자동 호출하지 않음). 실제 조회 배선은 랜딩 게스트 검색과
// 공유하는 useYoutubeSearchQuery가 담당합니다. 이전 추가 결과(성공/실패 메시지)를
// 지우는 건 이 훅의 책임이 아니라 호출부(ExplorePage)가 addTrackMutation.reset()을
// 같이 불러서 처리합니다.
//
// 비디오 ID 입력칸은 제목/아티스트와 다르게 동작합니다: 비디오 ID는 직접 타이핑하는
// 게 아니라 대부분 한 번에 붙여넣는 값이라, Enter/검색 버튼을 기다리지 않고 입력칸이
// 바뀌는 즉시 그 값으로 단건 조회(videoId 기준)를 실행합니다 — 존재하지 않는/형식이
// 안 맞는 값이면 조회 결과가 빈 배열로 돌아오므로 자연스럽게 "결과 없음"이 됩니다.
// 검색 결과 카드를 클릭했을 때는 반대 방향으로, 그 카드의 videoId를 입력칸에
// 채워주기만 하고 별도 조회는 다시 하지 않습니다(이미 결과 목록에 그 데이터가 있으므로).
export function useExploreSearch() {
  const [titleQuery, setTitleQuery] = useState("");
  const [artistQuery, setArtistQuery] = useState("");
  const [videoIdInput, setVideoIdInput] = useState("");
  const [lookupVideoId, setLookupVideoId] = useState<string | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  const {
    setSubmittedQuery,
    hasSearched: hasTextSearched,
    results: textResults,
    isFetching: isTextFetching,
    isError: isTextError,
  } = useYoutubeSearchQuery("youtube-search");

  const {
    data: idResults = [],
    isFetching: isIdFetching,
    isError: isIdError,
  } = useQuery({
    queryKey: ["youtube-search-by-id", lookupVideoId],
    queryFn: () => fetchExploreResultByVideoId(lookupVideoId!),
    enabled: lookupVideoId !== null,
  });

  const inIdMode = lookupVideoId !== null;
  const results = inIdMode ? idResults : textResults;
  const isFetching = inIdMode ? isIdFetching : isTextFetching;
  const isError = inIdMode ? isIdError : isTextError;
  const hasSearched = inIdMode || hasTextSearched;

  // 단건 조회 모드에서는 결과가 정확히 그 영상 1건이므로, 사용자가 카드를 한 번 더
  // 클릭하게 하지 않고 조회된 값을 곧바로 선택 상태로 취급합니다(state로 따로
  // 들고 있지 않고 idResults에서 매 렌더 파생시킵니다).
  const effectiveSelectedVideoId = inIdMode
    ? (idResults[0]?.videoId ?? null)
    : selectedVideoId;

  function handleSearch() {
    setVideoIdInput("");
    setLookupVideoId(null);
    setSubmittedQuery(`${titleQuery} ${artistQuery}`.trim());
  }

  // 카드 클릭: 결과 목록은 그대로 두고 입력칸에 videoId만 채웁니다.
  function selectVideo(videoId: string) {
    setSelectedVideoId(videoId);
    setVideoIdInput(videoId);
  }

  // 비디오 ID 입력칸 변경: 텍스트 검색 결과까지 포함해 즉시 전부 초기화하고,
  // 새 값으로 단건 조회를 다시 겁니다(빈 문자열이면 조회하지 않음).
  function handleVideoIdInputChange(value: string) {
    setVideoIdInput(value);
    setSelectedVideoId(null);
    setSubmittedQuery("");
    setLookupVideoId(value.trim() === "" ? null : value.trim());
  }

  // 추가 성공 후 선택 상태를 지웁니다 — 비디오 ID 입력칸도 함께 비워 다음 곡을
  // 새로 고를 수 있는 상태로 되돌립니다.
  function clearSelection() {
    setSelectedVideoId(null);
    setVideoIdInput("");
    setLookupVideoId(null);
  }

  const selected = useMemo(
    () => results.find((r) => r.videoId === effectiveSelectedVideoId),
    [results, effectiveSelectedVideoId],
  );

  return {
    titleQuery,
    setTitleQuery,
    artistQuery,
    setArtistQuery,
    videoIdInput,
    handleVideoIdInputChange,
    hasSearched,
    handleSearch,
    results,
    isFetching,
    isError,
    selectedVideoId: effectiveSelectedVideoId,
    selectVideo,
    clearSelection,
    selected,
  };
}
