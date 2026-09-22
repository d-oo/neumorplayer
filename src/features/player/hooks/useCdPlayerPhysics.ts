import { useEffect, useRef } from "react";
import { TICK_ON, TICK_OFF } from "../components/VolumeKnob";

// docs/design/랜딩 페이지.zip의 CD 플레이어 물리(디스크 관성 스크럽, 각도/수직
// 듀얼모드 볼륨 노브, 드래그 시크바)를 대시보드(PlayerPanel, usePlayerStore 연결)와
// 랜딩(useGuestPlayer 연결)이 함께 쓸 수 있도록 추상화한 훅입니다. 재생 상태의
// 소유자가 다르므로 값/콜백만 주입받고, 이 훅 자신은 어떤 전역 스토어도 알지 못합니다.
//
// 드래그 중 값(회전각·노브 각도 등)은 절대 React 상태로 만들지 않습니다 — 매 프레임
// 바뀌는 값을 setState하면 리렌더 폭주가 나므로, ref로 들고 있다가 discRef/knobRef가
// 가리키는 DOM을 직접 조작합니다. 실제로 재생 상태(currentTime/volume 등)가 바뀌는
// 순간에만 onSeek/onVolumeChange/onSetPlaying으로 커밋합니다.
interface UseCdPlayerPhysicsOptions {
  hasTrack: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number; // 0-100
  onSetPlaying: (playing: boolean) => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
}

// 디스크 한 바퀴(360°)를 30초로 스크럽하는 시안 스펙 — 12°당 1초.
const SCRUB_SECONDS_PER_DEGREE = 1 / 12;
// 노브 안쪽(수직 모드)에서 바깥쪽(각도 모드)으로 넘어가는 경계 반지름.
const KNOB_MODE_RADIUS = 18;
// 노브 수직 모드가 볼륨 0으로 취급하는 반경(이 밖에서는 수직 이동 민감도가 0에 가까워짐).
const KNOB_VERTICAL_FALLOFF_RADIUS = 30;

export function useCdPlayerPhysics({
  hasTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  onSetPlaying,
  onSeek,
  onVolumeChange,
}: UseCdPlayerPhysicsOptions) {
  const discRef = useRef<HTMLDivElement | null>(null);
  const knobRef = useRef<HTMLDivElement | null>(null);

  // 롱리빙 리스너(rAF 루프, pointermove 클로저)가 최신 값을 읽을 수 있도록 매 렌더
  // 동기화하는 ref들 — 클로저에 갇힌 stale 값 문제를 피합니다.
  const isPlayingRef = useRef(isPlaying);
  const currentTimeRef = useRef(currentTime);
  const durationRef = useRef(duration);
  const volumeRef = useRef(volume);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);
  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);
  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);
  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  // 디스크 회전 누적값과 관성 속도 — React 상태가 아니라 프레임마다 바뀌는 순수
  // ref입니다. 드래그 중엔 pointermove가, 아닐 땐 rAF 루프가 이 값을 갱신합니다.
  const rotationDegRef = useRef(0);
  const cdVelRef = useRef(0);
  const cdDraggingRef = useRef(false);

  // 마운트 시 관성 rAF 루프를 하나만 유지합니다(재생 중엔 아주 천천히 계속 도는
  // 느낌, 드래그 중엔 스킵).
  useEffect(() => {
    let frameId: number;
    const spin = () => {
      if (!cdDraggingRef.current) {
        const target = isPlayingRef.current ? 0.28 : 0;
        cdVelRef.current +=
          (target - cdVelRef.current) * (isPlayingRef.current ? 0.035 : 0.06);
        rotationDegRef.current += cdVelRef.current;
        if (discRef.current) {
          discRef.current.style.transform = `rotate(${rotationDegRef.current}deg)`;
        }
      }
      frameId = requestAnimationFrame(spin);
    };
    frameId = requestAnimationFrame(spin);
    return () => cancelAnimationFrame(frameId);
  }, []);

  function onDiscPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!hasTrack) return;
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    cdDraggingRef.current = true;
    const wasPlaying = isPlayingRef.current;
    if (wasPlaying) onSetPlaying(false);

    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const angleAt = (clientX: number, clientY: number) =>
      Math.atan2(clientX - cx, -(clientY - cy)) * (180 / Math.PI);

    let lastAngle = angleAt(e.clientX, e.clientY);
    let scrubAccum = 0;
    let totalSeconds = 0;
    const startTime = currentTimeRef.current;

    const handleMove = (ev: PointerEvent) => {
      const angle = angleAt(ev.clientX, ev.clientY);
      let delta = angle - lastAngle;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      lastAngle = angle;

      rotationDegRef.current += delta;
      if (discRef.current) {
        discRef.current.style.transform = `rotate(${rotationDegRef.current}deg)`;
      }

      scrubAccum += delta * SCRUB_SECONDS_PER_DEGREE;
      const wholeSeconds = Math.trunc(scrubAccum);
      if (wholeSeconds !== 0) {
        scrubAccum -= wholeSeconds;
        totalSeconds += wholeSeconds;
        const dur = durationRef.current;
        const next = Math.max(
          0,
          dur ? Math.min(startTime + totalSeconds, dur) : startTime + totalSeconds,
        );
        onSeek(next);
      }
    };

    const handleUp = () => {
      el.removeEventListener("pointermove", handleMove);
      el.removeEventListener("pointerup", handleUp);
      cdDraggingRef.current = false;
      if (wasPlaying) onSetPlaying(true);
    };

    el.addEventListener("pointermove", handleMove);
    el.addEventListener("pointerup", handleUp);
  }

  function onKnobPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const dialEl = el.querySelector<HTMLElement>("[data-dial]");
    const labelEl = el.querySelector<HTMLElement>("[data-vol-label]");
    const tickEls = el.querySelectorAll<HTMLElement>("[data-tick]");

    const angleAt = (clientX: number, clientY: number) =>
      Math.atan2(clientX - cx, -(clientY - cy)) * (180 / Math.PI);
    const radiusAt = (clientX: number, clientY: number) =>
      Math.hypot(clientX - cx, clientY - cy);

    const paint = (vol100: number) => {
      const angle = (vol100 / 100) * 270 - 135;
      if (dialEl) {
        dialEl.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
      }
      if (labelEl) labelEl.textContent = `${Math.round(vol100)}%`;
      const litCount = vol100 / 100;
      tickEls.forEach((tick, i) => {
        const lit = i / 24 <= litCount + 0.001;
        tick.style.background = lit ? TICK_ON : TICK_OFF;
        tick.style.boxShadow = lit ? `0 0 9px ${TICK_ON}` : "none";
      });
    };

    const startAngle = angleAt(e.clientX, e.clientY);
    const startRadius = radiusAt(e.clientX, e.clientY);
    const mode: "angle" | "vertical" =
      startRadius > KNOB_MODE_RADIUS ? "angle" : "vertical";

    let vol100 = volumeRef.current;
    // 각도 모드는 잡은 즉시 그 방향으로 스냅합니다. 다이얼 바닥(±135°~180° 사이)엔
    // 실제 손잡이처럼 멈춤 구간이 있어 그 안에서는 값을 갱신하지 않습니다 — 안 그러면
    // 바닥을 지나는 순간 반대쪽 극값으로 튀어버립니다(atan2가 ±180에서 부호가
    // 뒤집히는 지점이라 "경계 넘김"이 생김).
    let lastValidAngle = (vol100 / 100) * 270 - 135;
    if (mode === "angle") {
      if (startAngle >= -135 && startAngle <= 135) lastValidAngle = startAngle;
      vol100 = ((lastValidAngle + 135) / 270) * 100;
    }

    let lastY = e.clientY;
    let lastAngleForVertical = startAngle;

    paint(vol100);

    const handleMove = (ev: PointerEvent) => {
      if (mode === "angle") {
        const rawAngle = angleAt(ev.clientX, ev.clientY);
        if (rawAngle >= -135 && rawAngle <= 135) lastValidAngle = rawAngle;
        vol100 = Math.max(0, Math.min(100, ((lastValidAngle + 135) / 270) * 100));
      } else {
        const r = radiusAt(ev.clientX, ev.clientY);
        const verticalDelta =
          (lastY - ev.clientY) *
          1.6 *
          Math.max(0, 1 - r / KNOB_VERTICAL_FALLOFF_RADIUS);
        const angleNow = angleAt(ev.clientX, ev.clientY);
        let angleDelta = angleNow - lastAngleForVertical;
        if (angleDelta > 180) angleDelta -= 360;
        if (angleDelta < -180) angleDelta += 360;
        lastY = ev.clientY;
        lastAngleForVertical = angleNow;
        vol100 = Math.max(
          0,
          Math.min(100, vol100 + verticalDelta + (angleDelta / 270) * 100),
        );
      }
      paint(vol100);
    };

    const handleUp = () => {
      el.removeEventListener("pointermove", handleMove);
      el.removeEventListener("pointerup", handleUp);
      onVolumeChange(Math.round(vol100));
    };

    el.addEventListener("pointermove", handleMove);
    el.addEventListener("pointerup", handleUp);
  }

  function onSeekPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!durationRef.current) return;
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    const wasPlaying = isPlayingRef.current;
    if (wasPlaying) onSetPlaying(false);
    const rect = el.getBoundingClientRect();

    const update = (clientX: number) => {
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      onSeek(ratio * durationRef.current);
    };
    update(e.clientX);

    const handleMove = (ev: PointerEvent) => update(ev.clientX);
    const handleUp = () => {
      el.removeEventListener("pointermove", handleMove);
      el.removeEventListener("pointerup", handleUp);
      if (wasPlaying) onSetPlaying(true);
    };

    el.addEventListener("pointermove", handleMove);
    el.addEventListener("pointerup", handleUp);
  }

  return { discRef, onDiscPointerDown, knobRef, onKnobPointerDown, onSeekPointerDown };
}
