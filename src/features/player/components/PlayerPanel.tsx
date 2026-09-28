import { useNavigate } from "react-router-dom";
import { usePlayerStore } from "../lib/usePlayerStore";
import { selectIsAudible, selectIsLoading } from "../lib/playback-display";
import { useCdPlayerPhysics } from "../hooks/useCdPlayerPhysics";
import CdDisc from "./CdDisc";
import NowPlayingTitle from "./NowPlayingTitle";
import SeekBar from "./SeekBar";
import VolumeKnob from "./VolumeKnob";
import IconCircleButton from "@/shared/components/IconCircleButton";
import {
  InfoIcon,
  NextIcon,
  PrevIcon,
  RepeatIcon,
  ShuffleIcon,
} from "@/shared/components/icons";

// old-src/src/components/Player.js 자리를 대체하는, 어느 페이지에서든 항상 보이는
// CD 플레이어 카드입니다. docs/design/의 "1b 뉴모피즘 대시보드" 시안(CD 플레이어 섹션)을
// 색상·그림자·폰트까지 그대로 옮겼습니다. 실제 유튜브 iframe/오디오는 YouTubePlayer가
// 담당하고 여긴 usePlayerStore를 보고 그리는 컨트롤 UI만 담당합니다. 디스크 관성
// 스크럽·듀얼모드 볼륨 노브·드래그 시크바 물리는 features/landing과 공유하는
// useCdPlayerPhysics가 담당합니다.
export default function PlayerPanel() {
  const navigate = useNavigate();
  const queue = usePlayerStore((s) => s.queue);
  const currentIndex = usePlayerStore((s) => s.currentIndex);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  // 재생 버튼 아이콘·CD 회전은 selectIsAudible/selectIsLoading으로만 그립니다
  // (lib/playback-display.ts의 세 가지 표시 상태 참고).
  const isAudible = usePlayerStore(selectIsAudible);
  const isLoading = usePlayerStore(selectIsLoading);
  const shuffle = usePlayerStore((s) => s.shuffle);
  const loopQueue = usePlayerStore((s) => s.loopQueue);
  const volume = usePlayerStore((s) => s.volume);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const setIsPlaying = usePlayerStore((s) => s.setIsPlaying);
  const playNext = usePlayerStore((s) => s.playNext);
  const playPrev = usePlayerStore((s) => s.playPrev);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const toggleLoopQueue = usePlayerStore((s) => s.toggleLoopQueue);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const requestSeek = usePlayerStore((s) => s.requestSeek);
  const previewTime = usePlayerStore((s) => s.previewTime);
  const setIsScrubbing = usePlayerStore((s) => s.setIsScrubbing);

  const currentTrack = currentIndex >= 0 ? queue[currentIndex] : undefined;
  // old-src(Player.js disablePrev/disableNext)처럼 반복이 꺼져 있으면 앞/뒤 곡이 없을 때
  // 버튼을 끕니다. 반복이 켜져 있으면 처음↔끝으로 돌아가므로 켜 두되, 큐에 곡이
  // 하나뿐이면(단일 곡 재생) "이전/다음 곡" 자체가 없어서 반복과 상관없이 끕니다.
  const hasMultipleTracks = queue.length > 1;
  const disablePrev =
    !currentTrack || !hasMultipleTracks || (!loopQueue && currentIndex === 0);
  const disableNext =
    !currentTrack ||
    !hasMultipleTracks ||
    (!loopQueue && currentIndex === queue.length - 1);

  const physics = useCdPlayerPhysics({
    hasTrack: !!currentTrack,
    trackKey: currentTrack?.video_id,
    isSpinning: isAudible,
    currentTime,
    duration,
    volume,
    onSeek: requestSeek,
    onVolumeChange: setVolume,
    onScrubbingChange: setIsScrubbing,
    onPreviewTime: previewTime,
  });

  const toggleButtonClass =
    "shadow-neu-raised-sm hover:text-neu-hi active:shadow-neu-sunken";

  return (
    <section className="flex flex-col gap-3.75 rounded-3xl border border-(--neu-border-80) bg-neu-surface p-4.5 shadow-neu-raised">
      <div className="flex w-full items-center gap-3.5">
        <CdDisc
          discRef={physics.discRef}
          onPointerDown={physics.onDiscPointerDown}
          isPlaying={isAudible}
          isLoading={isLoading}
          hasTrack={!!currentTrack}
          videoId={currentTrack?.video_id}
          onTogglePlayClick={() => setIsPlaying(!isPlaying)}
        />

        {/* 컨트롤 + 볼륨 노브 */}
        <div className="flex min-w-0 flex-1 flex-col items-center gap-3.5">
          <div className="grid grid-cols-2 gap-2.5">
            <IconCircleButton
              size="lg"
              onClick={playPrev}
              disabled={disablePrev}
              aria-label="이전 곡"
              className={`${toggleButtonClass} text-(--neu-ink-34)`}
            >
              <PrevIcon />
            </IconCircleButton>
            <IconCircleButton
              size="lg"
              onClick={playNext}
              disabled={disableNext}
              aria-label="다음 곡"
              className={`${toggleButtonClass} text-(--neu-ink-34)`}
            >
              <NextIcon />
            </IconCircleButton>
            <IconCircleButton
              size="lg"
              onClick={toggleShuffle}
              aria-pressed={shuffle}
              aria-label="셔플"
              className={
                shuffle
                  ? "text-(--neu-tick-on-active) shadow-neu-sunken"
                  : `${toggleButtonClass} text-(--neu-ink-52)`
              }
            >
              <ShuffleIcon />
            </IconCircleButton>
            <IconCircleButton
              size="lg"
              onClick={toggleLoopQueue}
              aria-pressed={loopQueue}
              aria-label="반복"
              className={
                loopQueue
                  ? "text-(--neu-tick-on-active) shadow-neu-sunken"
                  : `${toggleButtonClass} text-(--neu-ink-52)`
              }
            >
              <RepeatIcon />
            </IconCircleButton>
          </div>

          <VolumeKnob
            knobRef={physics.knobRef}
            onPointerDown={physics.onKnobPointerDown}
            volume={volume}
          />
        </div>
      </div>

      <div className="flex items-center gap-3.5">
        <NowPlayingTitle
          title={currentTrack?.title ?? "재생 중인 곡 없음"}
          subtitle={currentTrack?.artist.join(", ") ?? "-"}
        />
        <IconCircleButton
          size="lg"
          disabled={!currentTrack}
          onClick={() => currentTrack && navigate(`/music/${currentTrack.id}`)}
          aria-label="음악 정보"
          className="flex-none text-(--neu-ink-52) shadow-neu-raised-sm hover:text-neu-hi active:shadow-neu-sunken"
        >
          <InfoIcon />
        </IconCircleButton>
      </div>

      <SeekBar
        currentTime={currentTime}
        duration={duration}
        onPointerDown={physics.onSeekPointerDown}
      />
    </section>
  );
}
