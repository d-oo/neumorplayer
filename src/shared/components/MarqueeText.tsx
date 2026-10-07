import type { CSSProperties } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

// 폭보다 긴 한 줄 텍스트를 위한 공용 컴포넌트입니다. 컨테이너 폭에 들어가면 그냥 한
// 줄로 보여주고, 넘치면 마퀴로 흘려 끝까지 보여줍니다. 쓰는 곳(사용자가 정한 규칙):
// CD 플레이어·재생 트랙 카드의 제목과 아티스트, 사이드바 재생목록 제목, 곡/재생목록
// 정보 페이지의 큰 제목과 곡 정보 페이지의 아티스트. 라이브러리·검색 결과·재생목록
// 정보의 곡 목록 행(제목·아티스트·태그)은 마퀴가 아니라 말줄임(truncate)입니다. 루트가
// <span>이라 <h1>처럼 phrasing content만 허용하는 요소 안에도 그대로 중첩할 수
// 있습니다 — 그 경우 타이포그래피(font-size/color 등, 상속되는 속성)는 부모 요소의
// className이 그대로 내려오므로 이 컴포넌트의 className은 생략해도 됩니다.
//
// 마퀴 동작(사용자 요청): 처음 위치에서 1.5초 기다렸다가 왼쪽으로 흘러가고, 마지막
// 글자가 오른쪽 끝에 나타나면 1.5초 멈춘 뒤 처음 위치로 한 번에 돌아갑니다 — 이걸
// 계속 반복합니다(예전엔 글자를 두 번 이어붙여 끊김 없이 도는 순환형이었음). 이동
// 거리가 글자마다 달라 대기/이동 구간의 비율이 매번 달라지므로, CSS @keyframes 대신
// Web Animations API로 오프셋을 계산해 겁니다. 이동 속도는 거리와 상관없이 일정합니다.
//
// pb-[0.35em]/-mb-[0.35em] 조합: overflow-hidden 박스에서 g/y/p 같은 디센더
// 글자가 줄 상자 아래로 잘리는 문제가 있었습니다(특히 MusicInfoPage/
// PlaylistInfoPage처럼 leading이 타이트한 큰 제목). line-height를 아무리 늘려도
// (2.0까지 테스트) 고쳐지지 않고, 실제 padding이나 height를 줘야만 고쳐지는 걸
// 확인했습니다. 그래서 디센더가 잘리지 않을 만큼 아래쪽에 padding을 주되, 같은
// 값만큼 margin을 음수로 줘서 다음 요소와의 실제 간격(레이아웃)은 그대로
// 유지합니다 — em 단위라 font-size가 다른 호출부(재생 중인 곡 제목 20px,
// 트랙/재생목록 제목 40px대 등)에서도 비율이 같이 따라갑니다.
const PX_PER_SECOND = 45;
// 처음 위치에서 출발 전, 끝 위치에서 되돌아가기 전에 멈춰 있는 시간.
const PAUSE_MS = 1500;

export default function MarqueeText({
  text,
  className,
  style,
}: {
  text: string;
  className?: string;
  style?: CSSProperties;
}) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const movingRef = useRef<HTMLSpanElement>(null);
  // 넘치는 폭(px) — 마지막 글자가 오른쪽 끝에 닿을 때까지 옮길 거리. 0이면 안 넘침.
  const [overflowPx, setOverflowPx] = useState(0);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;
    const diff = measure.scrollWidth - container.clientWidth;
    setOverflowPx(diff > 0 ? diff : 0);
  }, [text]);

  useEffect(() => {
    const el = movingRef.current;
    if (!el || overflowPx <= 0) return;
    const moveMs = (overflowPx / PX_PER_SECOND) * 1000;
    const total = PAUSE_MS + moveMs + PAUSE_MS;
    const end = `translateX(${-overflowPx}px)`;
    // 마지막 키프레임(끝 위치)에서 다음 반복의 첫 키프레임(처음 위치)으로 넘어갈 땐
    // 보간 없이 바로 바뀌어서, 끝에서 멈춘 뒤 처음으로 "확" 돌아갑니다.
    const animation = el.animate(
      [
        { transform: "translateX(0)", offset: 0 },
        { transform: "translateX(0)", offset: PAUSE_MS / total },
        { transform: end, offset: (PAUSE_MS + moveMs) / total },
        { transform: end, offset: 1 },
      ],
      { duration: total, iterations: Infinity, easing: "linear" },
    );
    return () => animation.cancel();
  }, [overflowPx, text]);

  return (
    <span
      ref={containerRef}
      className={`relative block overflow-hidden pb-[0.35em] mb-[-0.35em] whitespace-nowrap ${className ?? ""}`}
      style={style}
    >
      <span
        ref={measureRef}
        className="invisible absolute whitespace-nowrap"
        aria-hidden
      >
        {text}
      </span>
      {overflowPx > 0 ? (
        <span ref={movingRef} className="block w-max">
          {text}
        </span>
      ) : (
        <span>{text}</span>
      )}
    </span>
  );
}
