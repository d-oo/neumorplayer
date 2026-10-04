import { useEffect, useRef, useState } from "react";
import { tickStyle } from "../lib/volume-tick-style";
import {
  isTickLit,
  knobAngleToVolume,
  volumeToKnobAngle,
  wrapAngleDelta,
} from "../lib/dial-geometry";

// docs/design/랜딩 페이지.zip의 CD 플레이어 물리(디스크 관성 스크럽, 각도/수직
// 듀얼모드 볼륨 노브, 드래그 시크바)를 대시보드(PlayerPanel, usePlayerStore 연결)와
// 랜딩(useGuestPlayer 연결)이 함께 쓸 수 있도록 추상화한 훅입니다. 재생 상태의
// 소유자가 다르므로 값/콜백만 주입받고, 이 훅 자신은 어떤 전역 스토어도 알지 못합니다.
//
// 드래그 중 값(회전각·노브 각도 등)은 절대 React 상태로 만들지 않습니다 — 매 프레임
// 바뀌는 값을 setState하면 리렌더 폭주가 나므로, ref로 들고 있다가 discRef/knobRef가
// 가리키는 DOM을 직접 조작합니다. 실제로 재생 상태(currentTime/volume 등)가 바뀌는
// 순간에만 onSeek/onVolumeChange로 커밋합니다(볼륨은 드래그 중에도 정수 %가 바뀔
// 때마다 커밋 — onKnobPointerDown 참고).
//
// 시간 이동(CD 스크럽·재생바 드래그)은 old-src(Player.js의 Slider onChange/
// onChangeCommitted)와 같은 원칙입니다: 손을 움직이는 동안엔 onPreviewTime으로 화면
// 표시만 바꾸고, 손을 놓을 때 onSeek를 딱 한 번 보냅니다. 재생 상태(일시정지/재개)도
// 건드리지 않습니다 — 이 훅은 재생 상태를 알지 못하고, 드래그 중 이동 요청을 여러 번
// 보내거나 멈췄다 재개하던 예전 방식은 YouTube의 비동기 ENDED와 경쟁해 곡 끝까지
// 빠르게 끌고 놓으면 처음부터 다시 재생되는 문제가 있었습니다(useYouTubePlayback 참고).
interface UseCdPlayerPhysicsOptions {
  hasTrack: boolean;
  // 지금 곡을 구분하는 값(videoId). 드래그/스크럽 도중 이 값이 바뀌면(예: 재생목록에서
  // 곡 끝까지 스크럽해 다음 곡으로 넘어감) 그 제스처에서는 더 이상 이동 요청을 보내지
  // 않습니다 — 옛 곡 기준 시간을 새 곡에 적용하면 새 곡이 곧바로 끝 근처로 튀었습니다.
  trackKey: string | undefined;
  // CD가 실제로 돌지 여부 — 호출부가 selectIsAudible(lib/playback-display.ts)을
  // 넘깁니다(불러오는/버퍼링 중엔 멈춤).
  isSpinning: boolean;
  currentTime: number;
  duration: number;
  volume: number; // 0-100
  // 음소거 — 가운데 다이얼을 움직이지 않고 클릭하면 토글하고, 노브로 볼륨을 바꾸면
  // 풀립니다(old-src 볼륨 Slider의 onChange와 같음).
  muted: boolean;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onMutedChange: (muted: boolean) => void;
  // 드래그/스크럽 시작·끝 알림 — useYouTubePlayback.setScrubbing으로 이어져, 그동안
  // 폴링 값이 화면 표시(손 위치)를 덮어쓰지 않게 합니다.
  onScrubbingChange: (scrubbing: boolean) => void;
  // YouTube 이동 요청 없이 화면의 재생 시간만 옮기기(드래그/스크럽 도중 매 움직임).
  onPreviewTime: (time: number) => void;
}

// 디스크 한 바퀴(360°)를 30초로 스크럽하는 시안 스펙 — 12°당 1초.
const SCRUB_SECONDS_PER_DEGREE = 1 / 12;
// 노브 안쪽(수직 모드)에서 바깥쪽(각도 모드)으로 넘어가는 경계 반지름.
const KNOB_MODE_RADIUS = 18;
// 노브 수직 모드가 볼륨 0으로 취급하는 반경(이 밖에서는 수직 이동 민감도가 0에 가까워짐).
const KNOB_VERTICAL_FALLOFF_RADIUS = 30;
// 가운데 다이얼(수직 모드 영역)을 누른 뒤 이만큼 움직이기 전까지는 "클릭"으로 보고
// 볼륨을 바꾸지 않습니다 — 중심 근처는 1px만 흔들려도 각도가 크게 바뀌어, 그대로 두면
// 클릭만 해도 볼륨이 튀었습니다.
const KNOB_CLICK_SLOP_PX = 4;

export function useCdPlayerPhysics({
  hasTrack,
  trackKey,
  isSpinning,
  currentTime,
  duration,
  volume,
  muted,
  onSeek,
  onVolumeChange,
  onMutedChange,
  onScrubbingChange,
  onPreviewTime,
}: UseCdPlayerPhysicsOptions) {
  const discRef = useRef<HTMLDivElement | null>(null);
  const knobRef = useRef<HTMLDivElement | null>(null);
  // 볼륨 노브를 드래그하는 동안의 시작 볼륨(드래그 중이 아니면 null) — 아래 dialVolume 참고.
  const [knobDragStartVolume, setKnobDragStartVolume] = useState<
    number | null
  >(null);

  // 롱리빙 리스너(rAF 루프, pointermove 클로저)가 최신 값을 읽을 수 있도록 매 렌더
  // 동기화하는 ref들 — 클로저에 갇힌 stale 값 문제를 피합니다.
  const isSpinningRef = useRef(isSpinning);
  const currentTimeRef = useRef(currentTime);
  const durationRef = useRef(duration);
  const volumeRef = useRef(volume);
  const mutedRef = useRef(muted);
  const trackKeyRef = useRef(trackKey);
  useEffect(() => {
    isSpinningRef.current = isSpinning;
  }, [isSpinning]);
  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);
  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);
  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);
  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);
  useEffect(() => {
    trackKeyRef.current = trackKey;
  }, [trackKey]);

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
        const target = isSpinningRef.current ? 0.28 : 0;
        cdVelRef.current +=
          (target - cdVelRef.current) * (isSpinningRef.current ? 0.035 : 0.06);
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
    onScrubbingChange(true);

    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const angleAt = (clientX: number, clientY: number) =>
      Math.atan2(clientX - cx, -(clientY - cy)) * (180 / Math.PI);

    const gestureTrackKey = trackKeyRef.current;
    const trackChanged = () => trackKeyRef.current !== gestureTrackKey;

    let lastAngle = angleAt(e.clientX, e.clientY);
    let totalDegrees = 0;
    const startTime = currentTimeRef.current;
    const clampTime = (t: number) => {
      const dur = durationRef.current;
      return Math.max(0, dur ? Math.min(t, dur) : t);
    };
    // 화면에 보이는 위치 — 놓을 때 이 값으로 이동 요청을 한 번 보냅니다.
    let previewedTime = startTime;

    const handleMove = (ev: PointerEvent) => {
      const angle = angleAt(ev.clientX, ev.clientY);
      const delta = wrapAngleDelta(angle - lastAngle);
      lastAngle = angle;

      rotationDegRef.current += delta;
      if (discRef.current) {
        discRef.current.style.transform = `rotate(${rotationDegRef.current}deg)`;
      }
      // 곡이 바뀐 뒤엔 디스크만 돌고 시간은 건드리지 않습니다(trackKey 주석 참고).
      if (trackChanged()) return;

      // 화면 표시만 옮깁니다(YouTube 이동 요청은 놓을 때 한 번).
      totalDegrees += delta;
      previewedTime = clampTime(
        startTime + totalDegrees * SCRUB_SECONDS_PER_DEGREE,
      );
      onPreviewTime(previewedTime);
    };

    const handleUp = () => {
      el.removeEventListener("pointermove", handleMove);
      el.removeEventListener("pointerup", handleUp);
      cdDraggingRef.current = false;
      if (!trackChanged() && previewedTime !== startTime) onSeek(previewedTime);
      onScrubbingChange(false);
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

    // % 글자(data-vol-label)는 여기서 그리지 않습니다 — 실제 볼륨이 정수 %마다 바로
    // 커밋되니 React가 그 값으로 그립니다(VolumeKnob 주석).
    const dialEl = el.querySelector<HTMLElement>("[data-dial]");
    const tickEls = el.querySelectorAll<HTMLElement>("[data-tick]");

    const angleAt = (clientX: number, clientY: number) =>
      Math.atan2(clientX - cx, -(clientY - cy)) * (180 / Math.PI);
    const radiusAt = (clientX: number, clientY: number) =>
      Math.hypot(clientX - cx, clientY - cy);

    const paint = (vol100: number) => {
      const angle = volumeToKnobAngle(vol100);
      if (dialEl) {
        dialEl.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
      }
      tickEls.forEach((tick, i) => {
        const lit = isTickLit(i, vol100);
        const { background, boxShadow } = tickStyle(lit, mutedRef.current);
        tick.style.background = background;
        tick.style.boxShadow = boxShadow;
      });
    };

    setKnobDragStartVolume(volumeRef.current);

    const startAngle = angleAt(e.clientX, e.clientY);
    const startRadius = radiusAt(e.clientX, e.clientY);
    const mode: "angle" | "vertical" =
      startRadius > KNOB_MODE_RADIUS ? "angle" : "vertical";

    let vol100 = volumeRef.current;
    // 각도 모드는 잡은 즉시 그 방향으로 스냅합니다. 다이얼 바닥(±135°~180° 사이)엔
    // 실제 손잡이처럼 멈춤 구간이 있어 그 안에서는 값을 갱신하지 않습니다 — 안 그러면
    // 바닥을 지나는 순간 반대쪽 극값으로 튀어버립니다(atan2가 ±180에서 부호가
    // 뒤집히는 지점이라 "경계 넘김"이 생김).
    let lastValidAngle = volumeToKnobAngle(vol100);
    let wasInValidRange = startAngle >= -135 && startAngle <= 135;
    // 멈춤 구간에 들어온 쪽의 끝 각도(-135 또는 135) — handleMove 참고.
    let deadZoneEdge: number | null = null;
    if (mode === "angle") {
      if (wasInValidRange) lastValidAngle = startAngle;
      vol100 = knobAngleToVolume(lastValidAngle);
    }

    let lastY = e.clientY;
    let lastAngleForVertical = startAngle;
    // 가운데 다이얼(수직 모드)은 KNOB_CLICK_SLOP_PX를 넘게 움직여야 드래그가 시작되고,
    // 그 전에 손을 떼면 클릭(음소거 토글)입니다. 바깥 링(각도 모드)은 누르는 즉시 그
    // 각도로 볼륨을 정하는 기존 동작 그대로라 처음부터 드래그로 봅니다.
    let dragStarted = mode === "angle";

    // old-src(Player.js 볼륨 Slider의 onChange)처럼 드래그하는 동안에도 실제 볼륨을
    // 바로 바꿔서, 돌리면서 소리 크기를 들으며 맞출 수 있게 합니다. 정수(%)가 바뀔
    // 때만 보내서 pointermove마다 커밋하지 않습니다 — 시간 이동과 달리 볼륨은 YouTube의
    // 비동기 이벤트와 경쟁할 일이 없어 매번 보내도 안전합니다.
    // 노브로 볼륨을 실제로 바꾸면 음소거도 풉니다(old-src 볼륨 Slider의 onChange와 같음).
    let committedVolume = Math.round(volumeRef.current);
    const commitVolume = () => {
      const rounded = Math.round(vol100);
      if (rounded === committedVolume) return;
      committedVolume = rounded;
      onVolumeChange(rounded);
      if (mutedRef.current) {
        mutedRef.current = false;
        onMutedChange(false);
      }
    };

    paint(vol100);
    commitVolume();

    const handleMove = (ev: PointerEvent) => {
      if (mode === "angle") {
        const rawAngle = angleAt(ev.clientX, ev.clientY);
        // 유효 구간에서 멈춤 구간으로 들어가면 값을 그대로 두지 않고 들어온 쪽의 끝
        // (0% 또는 100%)에 붙입니다 — 그대로 두면 손을 빨리 움직여 끝을 지나칠 때 직전
        // 값(예: 1~2%)에 남아 0%까지 내려가지 않았습니다(실제로 겪음). 들어온 쪽을 멈춤
        // 구간을 벗어날 때까지 기억하므로, 바닥을 가로질러도 반대쪽 끝으로 튀지 않습니다.
        // 처음부터 멈춤 구간에서 잡았으면 들어온 쪽이 없으니 예전처럼 값을 유지합니다.
        if (rawAngle >= -135 && rawAngle <= 135) {
          lastValidAngle = rawAngle;
          deadZoneEdge = null;
          wasInValidRange = true;
        } else {
          if (wasInValidRange) deadZoneEdge = lastValidAngle < 0 ? -135 : 135;
          if (deadZoneEdge !== null) lastValidAngle = deadZoneEdge;
          wasInValidRange = false;
        }
        vol100 = Math.max(0, Math.min(100, knobAngleToVolume(lastValidAngle)));
      } else {
        if (!dragStarted) {
          if (
            Math.hypot(ev.clientX - e.clientX, ev.clientY - e.clientY) <
            KNOB_CLICK_SLOP_PX
          ) {
            return;
          }
          // 여기서부터 드래그 — 기준점을 지금 위치로 옮겨, 클릭 여유 거리만큼 움직인
          // 양이 한꺼번에 반영돼 볼륨이 튀지 않게 합니다.
          dragStarted = true;
          lastY = ev.clientY;
          lastAngleForVertical = angleAt(ev.clientX, ev.clientY);
          return;
        }
        const r = radiusAt(ev.clientX, ev.clientY);
        const verticalDelta =
          (lastY - ev.clientY) *
          1.6 *
          Math.max(0, 1 - r / KNOB_VERTICAL_FALLOFF_RADIUS);
        const angleNow = angleAt(ev.clientX, ev.clientY);
        const angleDelta = wrapAngleDelta(angleNow - lastAngleForVertical);
        lastY = ev.clientY;
        lastAngleForVertical = angleNow;
        vol100 = Math.max(
          0,
          Math.min(100, vol100 + verticalDelta + (angleDelta / 270) * 100),
        );
      }
      // 커밋이 먼저 — 이 움직임으로 음소거가 풀리면 눈금을 바로 일반 색으로 칠합니다.
      commitVolume();
      paint(vol100);
    };

    // pointercancel(터치 스크롤 전환 등)도 같이 받습니다 — 드래그 중엔 다이얼 표시값을
    // 고정해 두므로(dialVolume), 끝나는 이벤트를 놓치면 다이얼이 계속 멈춰 보입니다.
    // 취소된 제스처는 클릭으로 치지 않습니다(음소거를 토글하지 않음).
    const finish = (cancelled: boolean) => {
      el.removeEventListener("pointermove", handleMove);
      el.removeEventListener("pointerup", handleUp);
      el.removeEventListener("pointercancel", handleCancel);
      if (!dragStarted && !cancelled) {
        onMutedChange(!mutedRef.current);
      } else {
        commitVolume();
      }
      setKnobDragStartVolume(null);
    };
    const handleUp = () => finish(false);
    const handleCancel = () => finish(true);

    el.addEventListener("pointermove", handleMove);
    el.addEventListener("pointerup", handleUp);
    el.addEventListener("pointercancel", handleCancel);
  }

  function onSeekPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!durationRef.current) return;
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    onScrubbingChange(true);
    const rect = el.getBoundingClientRect();
    const gestureTrackKey = trackKeyRef.current;
    const trackChanged = () => trackKeyRef.current !== gestureTrackKey;
    let previewedTime = currentTimeRef.current;

    // 화면 표시만 옮깁니다(YouTube 이동 요청은 놓을 때 한 번).
    const update = (clientX: number) => {
      // 드래그 도중 곡이 바뀌었으면 새 곡의 표시는 건드리지 않습니다.
      if (trackChanged()) return;
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      previewedTime = ratio * durationRef.current;
      onPreviewTime(previewedTime);
    };
    update(e.clientX);

    const handleMove = (ev: PointerEvent) => update(ev.clientX);
    const handleUp = () => {
      el.removeEventListener("pointermove", handleMove);
      el.removeEventListener("pointerup", handleUp);
      if (!trackChanged()) onSeek(previewedTime);
      onScrubbingChange(false);
    };

    el.addEventListener("pointermove", handleMove);
    el.addEventListener("pointerup", handleUp);
  }

  // VolumeKnob의 다이얼·눈금을 그릴 값(dialVolume prop). 드래그 중엔 실제 볼륨이 정수
  // %마다 바뀌지만, 그 값으로 다이얼이 다시 그려지면 pointermove가 소수점 각도로 부드럽게
  // 그려 둔 노브를 정수 각도로 덮어써 뚝뚝 끊겨 보였습니다(실제로 겪음). 그래서 드래그
  // 중엔 드래그 시작 값에 고정해 React가 다이얼 DOM을 건드리지 않게 하고, 손을 놓으면
  // 실제 볼륨으로 돌아갑니다.
  const dialVolume = knobDragStartVolume ?? volume;

  return {
    discRef,
    onDiscPointerDown,
    knobRef,
    onKnobPointerDown,
    dialVolume,
    onSeekPointerDown,
  };
}
