import { useId, type CSSProperties } from "react";

type NoteLetter = "N" | "M" | "m" | "p" | "P";

// docs/design/음표 타이포그래피.zip(2a) — LandingHero의 "Neumorphism / Music
// Player" 타이틀에서 N·M·m·p·P를 대신하는 인라인 음표 SVG입니다. N/M/m은 빔으로
// 이어진 8분음표(높이만 다름 — 대문자는 캡하이트 0.7em, 소문자 m은 x-하이트
// 0.506em), p/P는 180도 회전한 2분음표입니다. fill="currentColor"라 부모 텍스트
// 색을 그대로 따르고, 높이가 em 단위라 font-size만 바꾸면 비율이 유지됩니다.
// p/P는 SVG <mask>로 음표머리 속을 비우는데, 이 컴포넌트가 한 화면에 여러 번
// 렌더되면(예: 같은 타이틀을 두 곳에 쓰는 경우) mask id가 겹쳐서 서로의 구멍을
// 지워버리므로 useId()로 인스턴스마다 고유한 id를 만듭니다.
export default function NoteGlyph({
  letter,
  marginLeft = "0em",
  marginRight = "0em",
  filter,
}: {
  letter: NoteLetter;
  marginLeft?: string;
  marginRight?: string;
  filter: string;
}) {
  const maskId = useId();

  const baseStyle: CSSProperties = {
    // Tailwind preflight가 svg 기본 display를 block으로 바꿔서, 명시적으로
    // inline을 다시 지정하지 않으면 텍스트 사이에서 줄바꿈이 생깁니다.
    display: "inline",
    verticalAlign: "baseline",
    margin: `0 ${marginRight} 0 ${marginLeft}`,
    overflow: "visible",
    filter,
  };

  switch (letter) {
    case "N":
      return (
        <svg
          viewBox="0 0 52.3 72"
          aria-label="N"
          style={{ ...baseStyle, height: "0.700em" }}
        >
          <rect x="10.8" y="7.0" width="8.5" height="56.1" fill="currentColor" />
          <ellipse
            cx="9.7"
            cy="63.1"
            rx="10"
            ry="8"
            transform="rotate(-25 9.7 63.1)"
            fill="currentColor"
          />
          <rect x="43.8" y="3.0" width="8.5" height="60.1" fill="currentColor" />
          <ellipse
            cx="42.7"
            cy="63.1"
            rx="10"
            ry="8"
            transform="rotate(-25 42.7 63.1)"
            fill="currentColor"
          />
          <polygon points="10.8,5 52.3,0 52.3,13 10.8,18" fill="currentColor" />
        </svg>
      );
    case "M":
      return (
        <svg
          viewBox="0 0 75.3 72"
          aria-label="M"
          style={{ ...baseStyle, height: "0.700em" }}
        >
          <rect x="10.8" y="9.5" width="8.5" height="53.6" fill="currentColor" />
          <ellipse
            cx="9.7"
            cy="63.1"
            rx="10"
            ry="8"
            transform="rotate(-25 9.7 63.1)"
            fill="currentColor"
          />
          <rect x="38.8" y="6.2" width="8.5" height="56.9" fill="currentColor" />
          <ellipse
            cx="37.7"
            cy="63.1"
            rx="10"
            ry="8"
            transform="rotate(-25 37.7 63.1)"
            fill="currentColor"
          />
          <rect x="66.8" y="3.0" width="8.5" height="60.1" fill="currentColor" />
          <ellipse
            cx="65.7"
            cy="63.1"
            rx="10"
            ry="8"
            transform="rotate(-25 65.7 63.1)"
            fill="currentColor"
          />
          <polygon points="10.8,7.5 75.3,0 75.3,13 10.8,20.5" fill="currentColor" />
        </svg>
      );
    case "m":
      return (
        <svg
          viewBox="0 0 71.3 52"
          aria-label="m"
          style={{ ...baseStyle, height: "0.506em" }}
        >
          <rect x="10.8" y="9.5" width="8.5" height="33.6" fill="currentColor" />
          <ellipse
            cx="9.7"
            cy="43.1"
            rx="10"
            ry="8"
            transform="rotate(-25 9.7 43.1)"
            fill="currentColor"
          />
          <rect x="36.8" y="6.3" width="8.5" height="36.8" fill="currentColor" />
          <ellipse
            cx="35.7"
            cy="43.1"
            rx="10"
            ry="8"
            transform="rotate(-25 35.7 43.1)"
            fill="currentColor"
          />
          <rect x="62.8" y="3.1" width="8.5" height="40.0" fill="currentColor" />
          <ellipse
            cx="61.7"
            cy="43.1"
            rx="10"
            ry="8"
            transform="rotate(-25 61.7 43.1)"
            fill="currentColor"
          />
          <polygon points="10.8,7.5 71.3,0 71.3,13 10.8,20.5" fill="currentColor" />
        </svg>
      );
    case "p":
      return (
        <svg
          viewBox="0 0 37 75"
          aria-label="p"
          style={{ ...baseStyle, height: "0.729em", verticalAlign: "-0.22em" }}
        >
          <defs>
            <mask id={maskId}>
              <rect x="0" y="0" width="37" height="75" fill="#fff" />
              <ellipse
                cx="18.2"
                cy="16"
                rx="11.5"
                ry="5.6"
                transform="rotate(-40 18.2 16)"
                fill="#000"
              />
            </mask>
          </defs>
          <g mask={`url(#${maskId})`}>
            <rect x="0" y="17" width="9.5" height="58" rx="4.75" fill="currentColor" />
            <ellipse
              cx="18.2"
              cy="16"
              rx="19"
              ry="14"
              transform="rotate(-25 18.2 16)"
              fill="currentColor"
            />
          </g>
        </svg>
      );
    case "P":
      return (
        <svg
          viewBox="0 0 37 72"
          aria-label="P"
          style={{ ...baseStyle, height: "0.700em" }}
        >
          <defs>
            <mask id={maskId}>
              <rect x="0" y="0" width="37" height="72" fill="#fff" />
              <ellipse
                cx="18.2"
                cy="16"
                rx="11.5"
                ry="5.6"
                transform="rotate(-40 18.2 16)"
                fill="#000"
              />
            </mask>
          </defs>
          <g mask={`url(#${maskId})`}>
            <rect x="0" y="17" width="9.5" height="55" rx="4.75" fill="currentColor" />
            <ellipse
              cx="18.2"
              cy="16"
              rx="19"
              ry="14"
              transform="rotate(-25 18.2 16)"
              fill="currentColor"
            />
          </g>
        </svg>
      );
  }
}
