import { useState } from "react";
import { usePlayerStore } from "../lib/usePlayerStore";
import { formatDuration } from "@/shared/lib/format-time";
import AddToPlaylistButton from "./AddToPlaylistButton";
import {
  NextIcon,
  PauseIcon,
  PlayIcon,
  PrevIcon,
  QueueIcon,
  RepeatIcon,
  ShuffleIcon,
} from "@/shared/components/icons";

// 디스크를 한 바퀴(360°) 돌리면 30초를 스크럽하는 정도의 감도입니다(시안 support.js의
// 실제 물리 스크럽과는 다르지만, 인터랙션의 의도는 같습니다).
const SCRUB_SECONDS_PER_DEGREE = 30 / 360;

// 카드 레벨에서 --tick-on/--tick-off를 이 값으로 오버라이드하고 있어서, 노브 눈금은
// 기본 액센트(#b344ff)가 아니라 이 값을 씁니다(docs/design/ 시안 그대로).
const TICK_ON = "#6d1a9f";
const TICK_OFF = "rgba(126,110,156,0.3)";

function VolumeTicks({ volume }: { volume: number }) {
  const vol = volume / 100;
  return (
    <>
      {Array.from({ length: 25 }, (_, i) => {
        const lit = i / 24 <= vol + 0.001;
        const len = i % 6 === 0 ? 11 : 8;
        return (
          <div
            key={i}
            className="absolute rounded-xs"
            style={{
              left: "50%",
              top: "50%",
              width: "3px",
              marginLeft: "-1.5px",
              height: `${len}px`,
              marginTop: `${-len / 2}px`,
              transformOrigin: "50% 50%",
              background: lit ? TICK_ON : TICK_OFF,
              boxShadow: lit ? `0 0 9px ${TICK_ON}` : "none",
              transform: `rotate(${(-135 + 11.25 * i).toFixed(2)}deg) translateY(${-(
                34 +
                len / 2
              )}px)`,
            }}
          />
        );
      })}
    </>
  );
}

// old-src/src/components/Player.js 자리를 대체하는, 어느 페이지에서든 항상 보이는
// CD 플레이어 카드입니다. docs/design/의 "1b 뉴모피즘 대시보드" 시안(CD 플레이어 섹션)을
// 색상·그림자·폰트까지 그대로 옮겼습니다. 실제 유튜브 iframe/오디오는 YouTubePlayer가
// 담당하고 여긴 usePlayerStore를 보고 그리는 컨트롤 UI만 담당합니다.
export default function PlayerPanel() {
  const [discDragDeg, setDiscDragDeg] = useState<number | null>(null);

  const queue = usePlayerStore((s) => s.queue);
  const currentIndex = usePlayerStore((s) => s.currentIndex);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
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

  const currentTrack = currentIndex >= 0 ? queue[currentIndex] : undefined;
  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const knobAngle = (volume / 100) * 270 - 135;

  function handleKnobPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const update = (clientX: number, clientY: number) => {
      const dx = clientX - cx;
      const dy = clientY - cy;
      const angle = Math.max(
        -135,
        Math.min(135, Math.atan2(dx, -dy) * (180 / Math.PI)),
      );
      setVolume(Math.round(((angle + 135) / 270) * 100));
    };

    update(e.clientX, e.clientY);
    const handleMove = (ev: PointerEvent) => update(ev.clientX, ev.clientY);
    const handleUp = () => {
      el.removeEventListener("pointermove", handleMove);
      el.removeEventListener("pointerup", handleUp);
    };
    el.addEventListener("pointermove", handleMove);
    el.addEventListener("pointerup", handleUp);
  }

  function handleDiscPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!currentTrack) return;
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const angleAt = (clientX: number, clientY: number) =>
      Math.atan2(clientX - cx, -(clientY - cy)) * (180 / Math.PI);

    let lastAngle = angleAt(e.clientX, e.clientY);
    let totalDeg = 0;
    let dragged = false;

    const handleMove = (ev: PointerEvent) => {
      const angle = angleAt(ev.clientX, ev.clientY);
      let delta = angle - lastAngle;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      if (Math.abs(delta) > 0.5) dragged = true;
      totalDeg += delta;
      lastAngle = angle;
      setDiscDragDeg(totalDeg);
    };

    const handleUp = () => {
      el.removeEventListener("pointermove", handleMove);
      el.removeEventListener("pointerup", handleUp);
      if (dragged) {
        const target = currentTime + totalDeg * SCRUB_SECONDS_PER_DEGREE;
        requestSeek(
          Math.max(0, duration ? Math.min(target, duration) : target),
        );
      } else {
        setIsPlaying(!isPlaying);
      }
      setDiscDragDeg(null);
    };

    el.addEventListener("pointermove", handleMove);
    el.addEventListener("pointerup", handleUp);
  }

  function handleSeekBarClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(
      1,
      Math.max(0, (e.clientX - rect.left) / rect.width),
    );
    requestSeek(ratio * duration);
  }

  const toggleButtonClass =
    "grid h-9.5 w-9.5 place-items-center rounded-full bg-neu-surface shadow-neu-raised-sm hover:text-neu-hi active:shadow-neu-sunken disabled:opacity-40";

  return (
    <section className="flex flex-col gap-3.75 rounded-3xl border border-white/80 bg-neu-surface p-4.5 shadow-neu-raised">
      <div className="flex w-full items-center gap-3.5">
        {/* CD 디스크 */}
        <div className="relative h-41.5 w-41.5 flex-none">
          <div
            onPointerDown={handleDiscPointerDown}
            className="absolute inset-0 cursor-grab touch-none select-none rounded-full active:cursor-grabbing"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, oklch(0.935 0.013 315) 0 28px, transparent 28px 30px), repeating-radial-gradient(circle at 50% 50%, rgba(126,110,156,0.13) 0 1px, rgba(255,255,255,0) 1px 3px), conic-gradient(from 210deg, rgba(255,255,255,0.85), rgba(255,255,255,0) 22%, rgba(255,255,255,0.6) 48%, rgba(255,255,255,0) 72%, rgba(255,255,255,0.85)), linear-gradient(150deg, rgba(179,68,255,0.14), transparent 70%), oklch(0.905 0.014 315)",
              boxShadow:
                "7px 7px 16px rgba(146,132,170,0.5), -6px -6px 14px rgba(255,255,255,0.95)",
              transform:
                discDragDeg !== null ? `rotate(${discDragDeg}deg)` : undefined,
            }}
          >
            <div
              className="absolute left-1/2 top-1/2 h-25.5 w-25.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                boxShadow:
                  "inset 2px 2px 5px rgba(146,132,170,0.4), inset -2px -2px 5px rgba(255,255,255,0.9)",
              }}
            />
            <div
              className="absolute left-1/2 top-1/2 h-15 w-15 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                background:
                  "linear-gradient(150deg, rgba(179,68,255,0.16), rgba(255,255,255,0.5) 72%)",
                boxShadow:
                  "inset 3px 3px 7px rgba(146,132,170,0.45), inset -3px -3px 7px rgba(255,255,255,0.95)",
              }}
            />
          </div>

          <div
            className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-neu-surface"
            style={{
              boxShadow:
                "5px 5px 12px rgba(146,132,170,0.5), -4px -4px 10px rgba(255,255,255,0.95)",
            }}
          >
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={!currentTrack}
              aria-label={isPlaying ? "일시정지" : "재생"}
              className="grid h-9.5 w-9.5 place-items-center rounded-full bg-neu-surface text-neu-hi transition-shadow hover:text-[oklch(0.32_0.14_305)] active:shadow-neu-sunken disabled:opacity-40"
              style={{
                boxShadow:
                  "4px 4px 9px rgba(146,132,170,0.5), -3px -3px 8px rgba(255,255,255,0.95)",
              }}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon className="ml-0.5" />}
            </button>
          </div>
        </div>

        {/* 컨트롤 + 볼륨 노브 */}
        <div className="flex min-w-0 flex-1 flex-col items-center gap-3.5">
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={playPrev}
              disabled={!currentTrack}
              aria-label="이전 곡"
              className={`${toggleButtonClass} text-[oklch(0.34_0.025_315)]`}
            >
              <PrevIcon />
            </button>
            <button
              type="button"
              onClick={playNext}
              disabled={!currentTrack}
              aria-label="다음 곡"
              className={`${toggleButtonClass} text-[oklch(0.34_0.025_315)]`}
            >
              <NextIcon />
            </button>
            <button
              type="button"
              onClick={toggleShuffle}
              aria-pressed={shuffle}
              aria-label="셔플"
              className={`${toggleButtonClass} ${
                shuffle ? "text-[#7b1fb0]" : "text-[oklch(0.52_0.02_315)]"
              }`}
            >
              <ShuffleIcon />
            </button>
            <button
              type="button"
              onClick={toggleLoopQueue}
              aria-pressed={loopQueue}
              aria-label="반복"
              className={`${toggleButtonClass} ${
                loopQueue ? "text-[#7b1fb0]" : "text-[oklch(0.52_0.02_315)]"
              }`}
            >
              <RepeatIcon />
            </button>
          </div>

          <div className="flex flex-col items-center gap-px">
            <div
              onPointerDown={handleKnobPointerDown}
              className="relative h-23 w-23 cursor-grab touch-none select-none active:cursor-grabbing"
            >
              <VolumeTicks volume={volume} />

              <div
                className="absolute left-1/2 top-1/2 h-15 w-15 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neu-surface"
                style={{
                  boxShadow:
                    "6px 6px 14px rgba(146,132,170,0.55), -5px -5px 12px rgba(255,255,255,0.95)",
                }}
              />

              <div
                className="absolute left-1/2 top-1/2 h-12.5 w-12.5 overflow-hidden rounded-full"
                style={{
                  background:
                    "conic-gradient(from 210deg, oklch(0.93 0.012 315), oklch(0.98 0.006 315) 9%, oklch(0.87 0.016 315) 23%, oklch(0.96 0.008 315) 37%, oklch(0.875 0.016 315) 51%, oklch(0.97 0.007 315) 65%, oklch(0.87 0.016 315) 79%, oklch(0.95 0.009 315) 91%, oklch(0.93 0.012 315))",
                  boxShadow:
                    "inset 2px 2px 5px rgba(146,132,170,0.35), inset -2px -2px 5px rgba(255,255,255,0.9)",
                  transform: `translate(-50%, -50%) rotate(${knobAngle}deg)`,
                }}
              >
                <div className="absolute left-1/2 top-1.25 h-2.5 w-0.75 -translate-x-1/2 rounded-full bg-neu-hi" />
              </div>
            </div>

            <div className="-mt-2.5 flex items-baseline gap-1.75">
              <div className="font-neu-mono text-xs text-[oklch(0.38_0.025_315)]">
                {volume}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3.5">
        <div className="min-w-0 flex-1">
          <div className="text-xl font-extrabold tracking-[-0.035em] leading-[1.15] text-neu-ink">
            {currentTrack?.title ?? "재생 중인 곡 없음"}
          </div>
          <div className="mt-1.25 truncate text-[12.5px] text-neu-muted">
            {currentTrack?.artist.join(", ") ?? "-"}
          </div>
        </div>
        {currentTrack ? (
          <AddToPlaylistButton track={currentTrack} variant="icon" />
        ) : (
          <button
            type="button"
            disabled
            aria-label="재생목록에 추가"
            className="grid h-9.5 w-9.5 flex-none place-items-center rounded-full bg-neu-surface text-[oklch(0.52_0.02_315)] opacity-40 shadow-neu-raised-sm"
          >
            <QueueIcon />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        <div className="w-8.5 font-neu-mono text-[11px] text-[oklch(0.46_0.025_315)]">
          {formatDuration(currentTime)}
        </div>
        <div
          onClick={handleSeekBarClick}
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
