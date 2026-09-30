import { useNavigate } from "react-router-dom";
import { usePlayerStore } from "@/features/player/lib/usePlayerStore";
import { currentTrackRowStyle } from "@/shared/styles/current-track-row-style";
import MarqueeText from "@/shared/components/MarqueeText";
import DurationPlayButton from "@/features/player/components/DurationPlayButton";
import TrackRowInfo from "./TrackRowInfo";
import type { Track } from "../lib/tracks";

// 헤더 행과 각 트랙 행이 같은 컬럼 폭을 써야 해서 한 곳에 둡니다.
const trackRowGridColumns = "minmax(0,1fr) 190px 74px 60px";

// 라이브러리 목록(LibraryPage)과 헤더 검색 결과의 각 탭(SearchResultsView)이 똑같은
// 모습이어야 해서(사용자 요청) 열 제목 헤더 행 + 트랙 행을 통째로 공유합니다. 정렬·
// 필터·빈 상태 안내는 화면마다 달라서 호출부가 담당하고, 여기엔 이미 걸러진 목록만
// 넘깁니다.
//
// 행 클릭 = 곡 상세 페이지 이동, 재생은 행 hover 때 재생시간 자리에 나타나는
// 버튼(DurationPlayButton)으로만 합니다.
//
// 현재 곡 강조(행 배경·제목 색)는 트랙 id만 보고 하지만, 재생시간 자리의 이퀄라이저는
// 단일 곡으로 재생 중일 때만 보여줍니다. 재생목록에서 재생 중인 곡이면 여기서는
// 재생 버튼을 그대로 둬서, 누르면 재생을 끊지 않고 단일 곡 재생으로 바꿀 수 있게
// 합니다(usePlayerStore.playTrackFrom의 "같은 곡 + 다른 맥락").
export default function LibraryTrackList({ tracks }: { tracks: Track[] }) {
  const navigate = useNavigate();
  const playTrackFrom = usePlayerStore((s) => s.playTrackFrom);
  const currentTrackId = usePlayerStore((s) =>
    s.currentIndex >= 0 ? s.queue[s.currentIndex]?.id : undefined,
  );
  const isSingleTrackPlayback = usePlayerStore(
    (s) => s.playingPlaylistId === null,
  );

  return (
    <>
      <div
        className="grid gap-4 px-3.5 pb-2.5 text-[11px] font-bold tracking-wider text-neu-muted"
        style={{
          gridTemplateColumns: trackRowGridColumns,
          borderBottom: "1px solid var(--neu-divider)",
        }}
      >
        <div className="pl-19.5">제목</div>
        <div>태그</div>
        <div className="text-right">재생 횟수</div>
        <div className="text-right">시간</div>
      </div>

      <div className="flex flex-col pt-1.5">
        {tracks.map((track) => {
          const isCurrentTrack = track.id === currentTrackId;
          return (
            <div
              key={track.id}
              onClick={() => navigate(`/music/${track.id}`)}
              className="group/track grid cursor-pointer items-center gap-4 rounded-[11px] px-3.5 py-2.25 hover:bg-neu-row-hover"
              style={{
                gridTemplateColumns: trackRowGridColumns,
                ...currentTrackRowStyle(isCurrentTrack),
              }}
            >
              <div className="flex items-center gap-3">
                <TrackRowInfo track={track} isCurrentTrack={isCurrentTrack} />
              </div>
              <MarqueeText
                text={track.tags.map((tag) => `#${tag}`).join("  ")}
                className="text-xs text-neu-muted"
              />
              <div className="text-right font-neu-mono text-[12.5px] text-neu-muted">
                {track.play_count.toLocaleString()}
              </div>
              <DurationPlayButton
                duration={track.duration}
                onPlay={() => playTrackFrom([track], 0)}
                label={`${track.title} 재생`}
                align="end"
                textClassName="font-neu-mono text-[12.5px] text-neu-muted"
                isCurrent={isCurrentTrack && isSingleTrackPlayback}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}
