import type { RefObject } from "react";
import { tickStyle } from "../lib/volume-tick-style";

function VolumeTicks({ volume, muted }: { volume: number; muted: boolean }) {
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
              ...tickStyle(lit, muted),
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

// PlayerPanel.tsx에서 분리한 순수 프리젠테이션 조각입니다. data-dial/data-tick은
// useCdPlayerPhysics가 드래그 중 리렌더 없이 직접 조작하는 자리입니다 —
// 다이얼·눈금은 dialVolume(useCdPlayerPhysics의 dialVolume)으로 그리는데, 이 값은
// 드래그 중 드래그 시작 값에 고정돼 React가 손을 따라 소수점 각도로 그려 둔 DOM을
// 정수 각도로 덮어쓰지 않고(덮어쓰면 뚝뚝 끊겨 보임), 손을 놓으면 실제 볼륨으로
// 돌아와 최종 상태가 일치합니다. % 글자는 정수라 끊김과 무관해서 실제 볼륨(volume)을
// 그대로 따라가며, 드래그 중에도 볼륨이 바뀔 때마다 갱신됩니다.
export default function VolumeKnob({
  knobRef,
  onPointerDown,
  volume,
  dialVolume,
  muted,
}: {
  knobRef: RefObject<HTMLDivElement | null>;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  volume: number;
  dialVolume: number;
  // 음소거 중이면 켜진 눈금을 연한 색으로, % 숫자에 취소선을 긋고, 받침 원·다이얼을
  // 눌린 모양으로 그립니다(가운데 다이얼 클릭으로 토글 — useCdPlayerPhysics의
  // onKnobPointerDown).
  muted: boolean;
}) {
  const knobAngle = (dialVolume / 100) * 270 - 135;

  return (
    <div className="flex flex-col items-center gap-px">
      <div
        ref={knobRef}
        onPointerDown={onPointerDown}
        className="relative h-23 w-23 cursor-grab touch-none select-none active:cursor-grabbing"
      >
        <VolumeTicks volume={dialVolume} muted={muted} />

        {/* 음소거 중엔 받침 원+다이얼이 눌린 버튼처럼 줄어듭니다(docs/design/볼륨 버튼.zip).
            눈금은 이 층 밖에 둬서 크기가 그대로이고, 다이얼의 transform은 드래그 중
            useCdPlayerPhysics가 직접 쓰는 자리라 크기 조절은 이 감싸는 층에만 겁니다. */}
        <div
          className="absolute inset-0"
          style={{
            transform: muted ? "scale(0.94)" : "scale(1)",
            transition: "transform 0.22s cubic-bezier(0.3, 0.7, 0.4, 1)",
          }}
        >
          <div
            className={`absolute left-1/2 top-1/2 h-15 w-15 -translate-x-1/2 -translate-y-1/2 rounded-full ${
              muted ? "bg-(--neu-knob-hub-muted)" : "bg-neu-surface"
            }`}
            style={{
              // 기본 상태 앞의 크기 0 inset 2개는 음소거 그림자와 개수를 맞춰 전환을
              // 자연스럽게 하려는 것이라 화면엔 아무것도 그리지 않습니다.
              boxShadow: muted
                ? "var(--neu-shadow-knob-hub-muted)"
                : "inset 0 0 0 transparent, inset 0 0 0 transparent, var(--neu-shadow-knob-hub)",
              transition: "box-shadow 0.22s ease, background 0.22s ease",
            }}
          />

          <div
            data-dial
            className="absolute left-1/2 top-1/2 h-12.5 w-12.5 overflow-hidden rounded-full"
            style={{
              background: "var(--neu-knob-texture)",
              boxShadow: muted
                ? "var(--neu-shadow-knob-dial-muted)"
                : "var(--neu-shadow-knob-dial)",
              opacity: muted ? 0.55 : 1,
              transform: `translate(-50%, -50%) rotate(${knobAngle}deg)`,
              transition: "box-shadow 0.22s ease, opacity 0.22s ease",
            }}
          >
            <div
              className={`absolute left-1/2 top-1.25 h-2.5 w-0.75 -translate-x-1/2 rounded-full ${
                muted ? "bg-(--neu-knob-pointer-muted)" : "bg-neu-hi"
              }`}
              style={{ transition: "background 0.22s ease" }}
            />
          </div>
        </div>
      </div>

      <div className="-mt-2.5 flex items-baseline gap-1.75">
        <div
          className={`font-neu-mono text-xs ${
            muted
              ? "text-(--neu-knob-label-muted) line-through"
              : "text-(--neu-ink-38)"
          }`}
          style={{ transition: "color 0.22s ease" }}
        >
          {volume}%
        </div>
      </div>
    </div>
  );
}
