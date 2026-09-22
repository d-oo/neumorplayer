import type { RefObject } from "react";

// 카드 레벨에서 --tick-on/--tick-off를 오버라이드할 수 있게 기본값을 export합니다.
// (docs/design/의 시안 값 그대로 — 기본 액센트 #b344ff가 아니라 이 값을 씁니다.)
export const TICK_ON = "#6d1a9f";
export const TICK_OFF = "rgba(126,110,156,0.3)";

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
            data-tick
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

// PlayerPanel.tsx에서 분리한 순수 프리젠테이션 조각입니다. data-dial/data-vol-label/
// data-tick은 useCdPlayerPhysics가 드래그 중 리렌더 없이 직접 조작하는 자리입니다 —
// pointerup에서 volume prop이 커밋되면 이 컴포넌트가 그 값으로 다시 그려지며 직접
// 조작한 DOM과 최종 상태가 일치합니다.
export default function VolumeKnob({
  knobRef,
  onPointerDown,
  volume,
}: {
  knobRef: RefObject<HTMLDivElement | null>;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  volume: number;
}) {
  const knobAngle = (volume / 100) * 270 - 135;

  return (
    <div className="flex flex-col items-center gap-px">
      <div
        ref={knobRef}
        onPointerDown={onPointerDown}
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
          data-dial
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
        <div
          data-vol-label
          className="font-neu-mono text-xs text-[oklch(0.38_0.025_315)]"
        >
          {volume}%
        </div>
      </div>
    </div>
  );
}
