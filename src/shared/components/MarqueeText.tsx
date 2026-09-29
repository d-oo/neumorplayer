import type { CSSProperties } from "react";
import { useLayoutEffect, useRef, useState } from "react";

// 폭보다 긴 한 줄 텍스트(재생 중인 곡 제목, 재생목록/트랙 제목, 태그 목록 등)를 위한
// 공용 컴포넌트입니다. 컨테이너 폭에 들어가면 그냥 한 줄로 보여주고, 넘치면 좌우로
// 끊기지 않는 마퀴 애니메이션(@keyframes neu-marquee, src/index.css)으로 무한
// 스크롤합니다. `truncate`(말줄임)를 대체하는 자리에 두루 씁니다. 루트가 <span>이라
// <h1>처럼 phrasing content만 허용하는 요소 안에도 그대로 중첩할 수 있습니다 —
// 그 경우 타이포그래피(font-size/color 등, 상속되는 속성)는 부모 요소의 className이
// 그대로 내려오므로 이 컴포넌트의 className은 생략해도 됩니다.
// pb-[0.35em]/-mb-[0.35em] 조합: overflow-hidden 박스에서 g/y/p 같은 디센더
// 글자가 줄 상자 아래로 잘리는 문제가 있었습니다(특히 MusicInfoPage/
// PlaylistInfoPage처럼 leading이 타이트한 큰 제목). line-height를 아무리 늘려도
// (2.0까지 테스트) 고쳐지지 않고, 실제 padding이나 height를 줘야만 고쳐지는 걸
// 확인했습니다. 그래서 디센더가 잘리지 않을 만큼 아래쪽에 padding을 주되, 같은
// 값만큼 margin을 음수로 줘서 다음 요소와의 실제 간격(레이아웃)은 그대로
// 유지합니다 — em 단위라 font-size가 다른 호출부(재생 중인 곡 제목 20px,
// 트랙/재생목록 제목 40px대 등)에서도 비율이 같이 따라갑니다.
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
