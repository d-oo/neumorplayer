import { useCdPlayerPhysics } from "@/features/player/hooks/useCdPlayerPhysics";
import CdDisc from "@/features/player/components/CdDisc";
import MarqueeText from "@/features/player/components/MarqueeText";
import VolumeKnob from "@/features/player/components/VolumeKnob";
import IconCircleButton from "@/shared/components/IconCircleButton";
import { RepeatIcon } from "@/shared/components/icons";
import { formatDuration } from "@/shared/lib/format-time";
import type { useGuestPlayer } from "../lib/useGuestPlayer";

// 340×297 CD 플레이어 카드. features/player의 CdDisc/VolumeKnob(순수 마크업)과
// useCdPlayerPhysics(공유 물리)를 그대로 재사용하되, 대시보드 PlayerPanel과 달리
// 이전/다음/셔플 버튼은 없습니다(시안 스펙 — 랜딩은 큐가 없어 반복 버튼 하나뿐).
// 실제 아티스트·앨범 구분이 없는 YouTube 데이터라 부제는 channelTitle만 씁니다.
export default function LandingCdPlayer({
  guestPlayer,
}: {
  guestPlayer: ReturnType<typeof useGuestPlayer>;
}) {
  const { track, isPlaying, currentTime, duration, volume, repeat } =
    guestPlayer;
  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  const physics = useCdPlayerPhysics({
    hasTrack: !!track,
    isPlaying,
    currentTime,
    duration,
    volume,
    onSetPlaying: guestPlayer.setPlaying,
    onSeek: guestPlayer.seek,
    onVolumeChange: guestPlayer.setVolume,
  });

  return (
    <section className="flex h-74.25 w-85 flex-none flex-col gap-3.75 rounded-3xl border border-white/80 bg-neu-surface p-4.5 shadow-neu-raised">
      <div className="flex w-full items-center gap-3.5">
        <CdDisc
          discRef={physics.discRef}
          onPointerDown={physics.onDiscPointerDown}
          isPlaying={isPlaying}
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
        <div className="min-w-0 flex-1">
          <MarqueeText
            text={track?.title ?? "재생 중인 곡 없음"}
            className="text-xl font-extrabold tracking-[-0.035em] text-neu-ink"
          />
          <div className="mt-1.25 truncate text-[12.5px] text-neu-muted">
            {track?.channelTitle ?? "-"}
          </div>
        </div>
        <IconCircleButton
          size="lg"
          onClick={guestPlayer.toggleRepeat}
          aria-pressed={repeat}
          aria-label="반복"
          className={
            repeat
              ? "flex-none text-neu-hi shadow-neu-sunken"
              : "flex-none text-[oklch(0.56_0.02_315)] shadow-neu-raised-sm hover:text-neu-hi"
          }
        >
          <RepeatIcon />
        </IconCircleButton>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="w-8.5 font-neu-mono text-[11px] text-[oklch(0.46_0.025_315)]">
          {formatDuration(currentTime)}
        </div>
        <div
          onPointerDown={physics.onSeekPointerDown}
          className="flex h-3.5 flex-1 cursor-pointer touch-none select-none items-center"
        >
          <div
            className="flex h-2.25 w-full items-center overflow-hidden rounded-full border border-white/60 px-0.5"
            style={{
              background: "oklch(0.905 0.014 315)",
              boxShadow:
                "inset 3px 3px 6px rgba(150,136,175,0.6), inset -2px -2px 5px rgba(255,255,255,0.95)",
            }}
          >
            <div
              className="h-1 rounded-full bg-neu-hi"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
        <div className="w-8.5 text-right font-neu-mono text-[11px] text-[oklch(0.46_0.025_315)]">
          -{formatDuration(Math.max(duration - currentTime, 0))}
        </div>
      </div>
    </section>
  );
}
