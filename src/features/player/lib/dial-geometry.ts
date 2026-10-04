// 볼륨 노브·CD 디스크의 각도 계산. VolumeKnob(React 렌더)과 useCdPlayerPhysics(드래그
// 중 리렌더 없이 DOM에 직접 그리기)가 같은 값을 그려야 해서 한 곳에 둡니다.
//
// 노브는 볼륨 0%가 -135°, 100%가 +135°인 270° 다이얼이고(바닥 90°는 멈춤 구간), 눈금은
// 25개(0~24번)를 그 270°에 고르게 놓습니다.

export function volumeToKnobAngle(volume: number): number {
  return (volume / 100) * 270 - 135;
}

export function knobAngleToVolume(angle: number): number {
  return ((angle + 135) / 270) * 100;
}

// index번 눈금이 켜질지(볼륨 위치까지). +0.001은 부동소수 오차로 볼륨 위치의 눈금이
// 꺼져 보이지 않게 하는 여유입니다.
export function isTickLit(index: number, volume: number): boolean {
  return index / 24 <= volume / 100 + 0.001;
}

// 두 각도(atan2 결과, -180~180°) 사이의 변화량을 -180~180° 안으로 맞춥니다 — 포인터가
// ±180° 경계를 넘을 때 한 번에 360° 가까이 튀지 않게 합니다.
export function wrapAngleDelta(delta: number): number {
  let wrapped = delta;
  if (wrapped > 180) wrapped -= 360;
  if (wrapped < -180) wrapped += 360;
  return wrapped;
}
