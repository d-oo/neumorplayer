import type { CSSProperties } from "react";
import { useLayoutEffect, useRef, useState } from "react";

// 폭보다 긴 한 줄 텍스트(재생 중인 곡 제목, 재생목록/트랙 제목, 태그 목록 등)를 위한
// 공용 컴포넌트입니다. 컨테이너 폭에 들어가면 그냥 한 줄로 보여주고, 넘치면 좌우로
// 끊기지 않는 마퀴 애니메이션(@keyframes neu-marquee, src/index.css)으로 무한
// 스크롤합니다. `truncate`(말줄임)를 대체하는 자리에 두루 씁니다. 루트가 <span>이라
// <h1>처럼 phrasing content만 허용하는 요소 안에도 그대로 중첩할 수 있습니다 —
// 그 경우 타이포그래피(font-size/color 등, 상속되는 속성)는 부모 요소의 className이
// 그대로 내려오므로 이 컴포넌트의 className은 생략해도 됩니다.
const PX_PER_SECOND = 45;
const MIN_DURATION_SECONDS = 6;

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
  const [scrollWidth, setScrollWidth] = useState(0);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;
    const diff = measure.scrollWidth - container.clientWidth;
    setScrollWidth(diff > 0 ? measure.scrollWidth : 0);
  }, [text]);

  const scrolling = scrollWidth > 0;
  const duration = Math.max(
    MIN_DURATION_SECONDS,
    scrollWidth / PX_PER_SECOND,
  );

  return (
    <span
      ref={containerRef}
      className={`relative block overflow-hidden whitespace-nowrap ${className ?? ""}`}
      style={style}
    >
      <span
        ref={measureRef}
        className="invisible absolute whitespace-nowrap"
        aria-hidden
      >
        {text}
      </span>
      {scrolling ? (
        <span
          className="flex w-max"
          style={{ animation: `neu-marquee ${duration}s linear infinite` }}
        >
          <span className="pr-12">{text}</span>
          <span className="pr-12" aria-hidden>
            {text}
          </span>
        </span>
      ) : (
        <span>{text}</span>
      )}
    </span>
  );
}
