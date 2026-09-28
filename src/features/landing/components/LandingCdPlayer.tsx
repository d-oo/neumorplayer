import { useCdPlayerPhysics } from "@/features/player/hooks/useCdPlayerPhysics";
import {
  selectIsAudible,
  selectIsLoading,
} from "@/features/player/lib/playback-display";
import CdDisc from "@/features/player/components/CdDisc";
import NowPlayingTitle from "@/features/player/components/NowPlayingTitle";
import SeekBar from "@/features/player/components/SeekBar";
import VolumeKnob from "@/features/player/components/VolumeKnob";
import IconCircleButton from "@/shared/components/IconCircleButton";
import { RepeatIcon } from "@/shared/components/icons";
import type { useGuestPlayer } from "../lib/useGuestPlayer";

// 340×297 CD 플레이어 카드. features/player의 CdDisc/VolumeKnob(순수 마크업)과
// useCdPlayerPhysics(공유 물리)를 그대로 재사용하되, 대시보드 PlayerPanel과 달리
// 이전/다음/셔플 버튼은 없습니다(시안 스펙 — 랜딩은 큐가 없어 반복 버튼 하나뿐).
// 실제 아티스트·앨범 구분이 없는 YouTube 데이터라 부제는 channelTitle만 씁니다.
// 재생 아이콘/스피너/CD 회전·스크럽 동작은 대시보드 PlayerPanel과 똑같이 맞춥니다
// (같은 셀렉터·같은 물리 옵션 — 한쪽만 바뀌면 안 됨).
export default function LandingCdPlayer({
  guestPlayer,
}: {
  guestPlayer: ReturnType<typeof useGuestPlayer>;
}) {
  const { track, isPlaying, currentTime, duration, volume, repeat } =
    guestPlayer;
  const isAudible = selectIsAudible(guestPlayer);
  const isLoading = selectIsLoading(guestPlayer);

  const physics = useCdPlayerPhysics({
    hasTrack: !!track,
    trackKey: track?.videoId,
    isSpinning: isAudible,
    currentTime,
    duration,
    volume,
    onSeek: guestPlayer.seek,
    onVolumeChange: guestPlayer.setVolume,
    onScrubbingChange: guestPlayer.setScrubbing,
    onPreviewTime: guestPlayer.previewTime,
  });

  return (
    <section className="flex h-74.25 w-85 flex-none flex-col gap-3.75 rounded-3xl border border-(--neu-border-80) bg-neu-surface p-4.5 shadow-neu-raised">
      <div className="flex w-full items-center gap-3.5">
        <CdDisc
          discRef={physics.discRef}
          onPointerDown={physics.onDiscPointerDown}
          isPlaying={isAudible}
          isLoading={isLoading}
          hasTrack={!!track}
          videoId={track?.videoId}
          onTogglePlayClick={() => guestPlayer.setPlaying(!isPlaying)}
        />
        <div className="flex min-w-0 flex-1 flex-col items-center">
          <VolumeKnob
            knobRef={physics.knobRef}
            onPointerDown={physics.onKnobPointerDown}
            volume={volume}
          />
        </div>
      </div>

      <div className="flex items-center gap-3.5">
        <NowPlayingTitle
          title={track?.title ?? "재생 중인 곡 없음"}
          subtitle={track?.channelTitle ?? "-"}
        />
        <IconCircleButton
          size="lg"
          onClick={guestPlayer.toggleRepeat}
          aria-pressed={repeat}
          aria-label="반복"
          className={
            repeat
              ? "flex-none text-neu-hi shadow-neu-sunken"
              : "flex-none text-(--neu-ink-56) shadow-neu-raised-sm hover:text-neu-hi"
          }
        >
          <RepeatIcon />
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
