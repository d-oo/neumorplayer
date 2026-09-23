import ActionButton from "@/shared/components/ActionButton";
import ResultCard from "@/features/explore/components/ResultCard";
import SearchFieldInput from "@/shared/components/SearchFieldInput";
import { fieldBoxStyle } from "@/shared/styles/field-box-style";
import InfoBox from "@/shared/components/InfoBox";
import { PlayIcon, SearchGlyphIcon, XIcon } from "@/shared/components/icons";
import type { useGuestPlayer } from "../lib/useGuestPlayer";
import type { useLandingSearch } from "../lib/useLandingSearch";

// 886px 탐색 카드. 검색은 실제 /api/youtube-search를 그대로 호출하는
// useLandingSearch가 담당하고, 결과 카드는 explore의 ResultCard를 그대로
// 재사용합니다(마크업이 시안과 동일). 시안엔 검색 결과에 "앨범"이 표시되지만 YouTube
// Data API엔 앨범 개념이 없어 ResultCard도 표시하지 않으므로 추가 처리가 필요 없고,
// placeholder 카피만 앨범을 빼서 맞췄습니다.
export default function LandingSearchCard({
  search,
  guestPlayer,
}: {
  search: ReturnType<typeof useLandingSearch>;
  guestPlayer: ReturnType<typeof useGuestPlayer>;
}) {
  function handlePlay() {
    if (!search.picked) return;
    guestPlayer.playTrack({
      videoId: search.picked.videoId,
      title: search.picked.title,
      channelTitle: search.picked.channelTitle,
    });
  }

  return (
    <section className="flex w-full flex-col gap-5.5 rounded-3xl border border-(--neu-border-80) bg-neu-surface p-6.5 pt-6 shadow-neu-raised">
      <div className="flex items-center justify-between gap-4">
        <div
          className="flex w-95 items-center gap-2.5 rounded-xl border border-(--neu-border-80) px-4 py-2.75"
          style={fieldBoxStyle}
        >
          <SearchFieldInput
            value={search.query}
            onChange={(e) => search.setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") search.submitSearch();
            }}
            placeholder="제목이나 아티스트로 검색"
          />
          {search.query !== "" && (
            <button
              type="button"
              onClick={search.clearQuery}
              aria-label="검색어 지우기"
              className="grid h-4.5 w-4.5 flex-none place-items-center text-(--neu-ink-55) hover:text-(--neu-ink-20)"
            >
              <XIcon />
            </button>
          )}
          <button
            type="button"
            onClick={search.submitSearch}
            aria-label="검색"
            className="grid h-4.25 w-4.25 flex-none cursor-pointer place-items-center text-(--neu-ink-50-b) hover:text-(--neu-ink-20)"
          >
            <SearchGlyphIcon />
          </button>
        </div>

        <ActionButton
          label="재생"
          icon={<PlayIcon />}
          enabled={search.pick !== null}
          onClick={handlePlay}
        />
      </div>

      {search.shown.length > 0 ? (
        <div className="grid grid-cols-3 gap-5">
          {search.shown.map((r) => (
            <ResultCard
              key={r.videoId}
              result={r}
              isSelected={r.videoId === search.pick}
              onSelect={() => search.setPick(r.videoId)}
            />
          ))}
        </div>
      ) : (
        <InfoBox>
          {search.isFetching
            ? "검색 중..."
            : search.isError
              ? "검색 중 오류가 발생했습니다."
              : search.hasSearched
                ? "검색 결과가 없습니다. 다른 제목이나 아티스트로 찾아보세요."
                : "제목이나 아티스트를 입력하고 검색해보세요."}
        </InfoBox>
      )}
    </section>
  );
}
