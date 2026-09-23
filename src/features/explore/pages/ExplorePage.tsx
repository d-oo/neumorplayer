import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  fetchLibraryTracks,
  tracksQueryKey,
} from "@/features/library/lib/tracks";
import { useQuery } from "@tanstack/react-query";
import { useDocumentTitle } from "@/shared/lib/useDocumentTitle";
import InfoBox from "@/shared/components/InfoBox";
import SearchFieldInput from "@/shared/components/SearchFieldInput";
import { fieldBoxStyle } from "@/shared/styles/field-box-style";
import { useExploreSearch } from "@/features/explore/lib/useExploreSearch";
import { useTagSelection } from "@/features/explore/lib/useTagSelection";
import { useAddTrackMutation } from "@/features/explore/lib/useAddTrackMutation";
import ActionButton from "@/shared/components/ActionButton";
import ResultCard from "@/features/explore/components/ResultCard";
import { TagInputRow, TagChipList } from "@/features/explore/components/TagPicker";

// old-src/src/components/AddMusic.js + VideoSearchResult.js가 하던 역할을 이어받는
// 자리. old-src에서는 라이브러리 검색 화면 안의 모달이었지만, docs/product-flow.md에
// 정리된 흐름대로 별도 라우트("탐색")로 분리했습니다. docs/design/ 시안(탐색 화면)의
// 색상·그림자·치수를 그대로 옮겼습니다.
// 제목/아티스트를 입력하고 "검색" 버튼(또는 입력창에서 Enter)을 눌러야 실제로
// /api/youtube-search를 호출합니다(타이핑마다 자동 호출하지 않음). 아티스트는 old-src처럼 콤마로 여러 명 입력할 수 있고, 콤마로 구분된 조각 중
// 하나라도 비어 있으면(trailing comma 등) "추가" 버튼이 비활성화됩니다. 제목이
// 비어 있어도 마찬가지입니다.
export default function ExplorePage() {
  useDocumentTitle("NeumorPlayer");
  const { user } = useAuth();

  const { data: libraryTracks = [] } = useQuery({
    queryKey: tracksQueryKey(user?.id),
    queryFn: fetchLibraryTracks,
    enabled: !!user,
  });

  const {
    titleQuery,
    setTitleQuery,
    artistQuery,
    setArtistQuery,
    videoIdInput,
    handleVideoIdInputChange: setVideoIdInputRaw,
    hasSearched,
    handleSearch: submitSearch,
    results,
    isFetching,
    isError,
    selectedVideoId,
    selectVideo: selectVideoRaw,
    clearSelection,
    selected,
  } = useExploreSearch();

  const {
    suggestedTags,
    allTags,
    selectedTags,
    tagInput,
    setTagInput,
    toggleTag: toggleTagRaw,
    handleAddTagInput: submitTagInput,
    reset: resetTagSelection,
  } = useTagSelection(libraryTracks);

  const addTrack = useAddTrackMutation({
    userId: user?.id,
    titleQuery,
    artistQuery,
    selected,
    selectedTags,
    onSuccess: () => {
      setTitleQuery("");
      setArtistQuery("");
      clearSelection();
      resetTagSelection();
    },
  });

  // 검색어를 바꾸거나 결과/태그를 다시 고를 때는 이전 추가 결과(성공/실패 메시지)를
  // 지워야 하므로, 각 훅의 순수 상태 변경 함수에 addTrackMutation.reset()을 얹어서
  // 씁니다.
  function handleSearch() {
    addTrack.mutation.reset();
    submitSearch();
  }

  function selectVideo(videoId: string) {
    addTrack.mutation.reset();
    selectVideoRaw(videoId);
  }

  function handleVideoIdInputChange(value: string) {
    addTrack.mutation.reset();
    setVideoIdInputRaw(value);
  }

  function toggleTag(tag: string) {
    addTrack.mutation.reset();
    toggleTagRaw(tag);
  }

  function handleAddTagInput() {
    addTrack.mutation.reset();
    submitTagInput();
  }

  // old-src와 같은 규칙: 콤마로 구분된 조각 중 하나라도(trailing comma, 빈 조각 등)
  // 비어 있으면 무효로 취급합니다.
  const isArtistInputValid =
    artistQuery.trim() !== "" &&
    artistQuery.split(",").every((s) => s.trim() !== "");

  return (
    <div>
      <h1 className="mb-1.75 text-[26px] font-extrabold tracking-[-0.035em] text-neu-ink">
        탐색
      </h1>
      <p className="mb-6.5 text-[13px] text-neu-muted">
        아티스트와 제목으로 찾아 라이브러리에 추가합니다.
      </p>

      <div className="mb-7 grid grid-cols-2 gap-3.5">
        <div>
          <div className="mb-2.25 text-[11.5px] font-bold tracking-[0.06em] text-neu-muted">
            제목
          </div>
          <div
            className="flex items-center rounded-[11px] border border-(--neu-border-80) px-3.5 py-2.5"
            style={fieldBoxStyle}
          >
            <SearchFieldInput
              value={titleQuery}
              onChange={(e) => setTitleQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              placeholder="예: Bloom"
              lineHeightPx={20.25}
            />
          </div>
        </div>
        <div>
          <div className="mb-2.25 text-[11.5px] font-bold tracking-[0.06em] text-neu-muted">
            아티스트
          </div>
          <div
            className="flex items-center rounded-[11px] border border-(--neu-border-80) px-3.5 py-2.5"
            style={fieldBoxStyle}
          >
            <SearchFieldInput
              value={artistQuery}
              onChange={(e) => setArtistQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              placeholder="예: Mira Vell"
              lineHeightPx={20.25}
            />
          </div>
        </div>
      </div>

      <div className="mb-7 flex justify-end">
        <ActionButton
          label="검색"
          enabled={titleQuery.trim() !== "" || artistQuery.trim() !== ""}
          onClick={handleSearch}
        />
      </div>

      <div className="mb-3 flex items-baseline gap-2.25">
        <div className="text-[11.5px] font-bold tracking-[0.06em] text-neu-muted">
          검색 결과
        </div>
        <div className="text-xs text-(--neu-ink-55)">
          {hasSearched && !isFetching ? `${results.length}건` : ""}
        </div>
      </div>

      {results.length > 0 ? (
        <div className="mb-7 grid grid-cols-3 gap-4">
          {results.map((r) => (
            <ResultCard
              key={r.videoId}
              result={r}
              isSelected={r.videoId === selectedVideoId}
              onSelect={() => selectVideo(r.videoId)}
            />
          ))}
        </div>
      ) : (
        <InfoBox className="mb-7">
          {isFetching
            ? "검색 중..."
            : isError
              ? "검색 중 오류가 발생했습니다."
              : hasSearched
                ? "일치하는 곡이 없습니다."
                : "아티스트나 제목을 입력하고 검색을 눌러주세요."}
        </InfoBox>
      )}

      <div className="mb-3 grid grid-cols-2 items-start gap-3.5">
        <TagInputRow
          tagInput={tagInput}
          onTagInputChange={setTagInput}
          onAddTagInput={handleAddTagInput}
        />
        <div>
          <div className="mb-2.25 text-[11.5px] font-bold tracking-[0.06em] text-neu-muted">
            비디오 ID
          </div>
          <div
            className="flex items-center rounded-[11px] border border-(--neu-border-80) px-3.5 py-2.5"
            style={fieldBoxStyle}
          >
            <SearchFieldInput
              value={videoIdInput}
              onChange={(e) => handleVideoIdInputChange(e.target.value)}
              placeholder="유튜브 영상을 검색 결과에서 고르거나, 비디오 ID를 붙여넣으세요"
              lineHeightPx={20.25}
            />
          </div>
        </div>
      </div>

      <TagChipList
        allTags={allTags}
        suggestedTags={suggestedTags}
        selectedTags={selectedTags}
        onToggleTag={toggleTag}
      />

      <div className="flex items-center justify-end gap-3">
        {addTrack.errorMessage && (
          <span className="text-[12.5px] font-semibold text-red-500">
            {addTrack.errorMessage}
          </span>
        )}
        {!addTrack.errorMessage && addTrack.mutation.isSuccess && !selected && (
          <span className="text-[12.5px] font-semibold text-neu-hi">
            라이브러리에 추가했습니다.
          </span>
        )}
        <ActionButton
          label={addTrack.mutation.isPending ? "추가 중..." : "추가"}
          enabled={
            !!selected &&
            titleQuery.trim() !== "" &&
            isArtistInputValid &&
            !addTrack.mutation.isPending
          }
          onClick={() => addTrack.mutation.mutate()}
        />
      </div>
    </div>
  );
}
