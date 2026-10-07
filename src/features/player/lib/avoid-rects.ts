// 미니 플레이어(YouTubePlayer)가 모달 카드처럼 피해야 하는 사각형과 겹치면, 가장 적게
// 움직이는 방향(위·아래·왼쪽·오른쪽)으로 밀어낸 위치를 돌려줍니다. 화면 좌표(px) 기준.

export interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

// 플레이어 박스 좌상단이 있을 수 있는 범위.
export interface Bounds {
  minLeft: number;
  maxLeft: number;
  minTop: number;
  maxTop: number;
}

export interface BoxSize {
  width: number;
  height: number;
  // 박스 위쪽 바깥에 함께 붙어 있어서 같이 피해야 하는 높이(떠 있을 때의 손잡이 바).
  topExtra: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

export function pushOutOfRects(
  pos: { left: number; top: number },
  size: BoxSize,
  obstacles: Rect[],
  bounds: Bounds,
  gap: number,
): { left: number; top: number } {
  let { left, top } = pos;
  for (const raw of obstacles) {
    const ob = {
      left: raw.left - gap,
      top: raw.top - gap,
      right: raw.right + gap,
      bottom: raw.bottom + gap,
    };
    const overlaps =
      left < ob.right &&
      left + size.width > ob.left &&
      top - size.topExtra < ob.bottom &&
      top + size.height > ob.top;
    if (!overlaps) continue;

    const candidates = [
      { left: ob.right, top },
      { left: ob.left - size.width, top },
      { left, top: ob.bottom + size.topExtra },
      { left, top: ob.top - size.height },
    ];
    const fits = (c: { left: number; top: number }) =>
      c.left >= bounds.minLeft &&
      c.left <= bounds.maxLeft &&
      c.top >= bounds.minTop &&
      c.top <= bounds.maxTop;
    const distance = (c: { left: number; top: number }) =>
      Math.abs(c.left - left) + Math.abs(c.top - top);
    const byDistance = [...candidates].sort((a, b) => distance(a) - distance(b));
    // 화면 안에 들어가는 방향이 없으면(창이 아주 작을 때) 가장 가까운 방향으로 밀되
    // 화면 밖으로는 나가지 않게 합니다 — 이 경우엔 겹침이 남을 수 있습니다.
    const chosen = byDistance.find(fits) ?? byDistance[0];
    left = clamp(chosen.left, bounds.minLeft, bounds.maxLeft);
    top = clamp(chosen.top, bounds.minTop, bounds.maxTop);
  }
  return { left, top };
}
