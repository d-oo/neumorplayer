import { usePlayerStore } from "../lib/usePlayerStore";
import { currentTrackRowStyle } from "@/shared/styles/current-track-row-style";
import DurationPlayButton from "./DurationPlayButton";
import TrackThumbnail from "@/shared/components/TrackThumbnail";
import ThumbBox from "@/shared/components/ThumbBox";
import MutedNote from "@/shared/components/MutedNote";
import MarqueeText from "@/shared/components/MarqueeText";

// 사이드바 QueueCard(dashboard)의 "재생 트랙" 탭 내용. 지금 큐 전체(단일 곡 재생이면
// 그 곡 하나, 재생목록 재생이면 이미 들은 곡까지 포함한 재생목록 전체)를 보여주고
// 현재 곡을 강조합니다. 현재 곡 행의 data-active="true"는 QueueCard가 탭을 열 때 그
// 행으로 스크롤하는 표시입니다.
export default function QueueTrackList() {
  const queue = usePlayerStore((s) => s.queue);
  const currentIndex = usePlayerStore((s) => s.currentIndex);
  const jumpTo = usePlayerStore((s) => s.jumpTo);

  if (queue.length === 0) {
    return (
      <MutedNote className="px-2 py-1.75">재생 중인 곡이 없습니다.</MutedNote>
    );
  }

  return (
    <div className="flex flex-col gap-0.75">
      {queue.map((track, i) => {
        const isCurrent = i === currentIndex;
        return (
          // 행 클릭은 아무 동작도 하지 않습니다 — 재생은 재생시간 자리의
          // hover 버튼으로만(DurationPlayButton 주석 참고).
          <div
            key={track.id}
            data-active={isCurrent}
            className="group/track flex items-center gap-2.75 rounded-[10px] px-2 py-1.75 hover:bg-neu-row-hover"
            style={currentTrackRowStyle(isCurrent)}
          >
            <ThumbBox>
              <TrackThumbnail
                videoId={track.video_id}
                className="h-full w-full"
              />
            </ThumbBox>
            <div className="min-w-0 flex-1">
              {/* 제목·아티스트 모두 넘치면 마퀴입니다(사용자 요청 — 좁은 사이드바라
                  말줄임으로는 알아보기 어려움). */}
              <MarqueeText
                text={track.title}
                className="text-[13px] font-semibold leading-4.5"
                style={{
                  color: isCurrent ? "var(--neu-hi)" : "var(--neu-ink)",
                }}
              />
              <MarqueeText
                text={track.artist.join(", ")}
                className="mt-0.5 text-[11.5px] leading-3.75 text-neu-muted"
              />
            </div>
            <DurationPlayButton
              duration={track.duration}
              onPlay={() => jumpTo(i)}
              label={`${track.title} 재생`}
              align="end"
              textClassName="font-neu-mono text-[11.5px] text-neu-muted"
              isCurrent={isCurrent}
            />
          </div>
        );
      })}
    </div>
  );
}
