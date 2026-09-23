import MarqueeText from "@/features/player/components/MarqueeText";
import ThumbBox from "@/shared/components/ThumbBox";
import TrackThumbnail from "@/shared/components/TrackThumbnail";
import type { Track } from "../lib/tracks";

// 트랙 목록 행의 "썸네일 + 제목 + 아티스트" 묶음. 라이브러리(LibraryPage)와 재생목록
// 정보(PlaylistInfoPage)가 값까지 완전히 같은 마크업을 각자 들고 있어서 뽑았습니다.
// 행을 감싸는 컨테이너(grid 컬럼 수, 클릭 동작, dnd-kit transform)는 화면마다 달라서
// 호출부에 그대로 두고, 여기서는 두 자식만 조각(Fragment)으로 돌려줍니다.
//
// 사이드바 QueueCard와 헤더 검색 결과(SearchResultsView)의 행은 겉보기엔 비슷해도
// 제목이 마퀴가 아니라 말줄임이고 글자 크기도 달라서 일부러 합치지 않았습니다.
export default function TrackRowInfo({
  track,
  isCurrentTrack,
}: {
  track: Track;
  isCurrentTrack: boolean;
}) {
  return (
    <>
      <ThumbBox size="row">
        <TrackThumbnail videoId={track.video_id} className="h-full w-full" />
      </ThumbBox>
      <div className="min-w-0">
        <MarqueeText
          text={track.title}
          className="text-sm font-semibold"
          style={{
            color: isCurrentTrack ? "var(--neu-hi)" : "var(--neu-ink)",
          }}
        />
        <p className="mt-0.75 truncate text-[12.5px] text-neu-muted">
          {track.artist.join(", ")}
        </p>
      </div>
    </>
  );
}
