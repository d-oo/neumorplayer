import NoteGlyph from "./NoteGlyph";

// 1236px 폭(부모가 배치), 가운데 정렬. "Developed with YouTube" 배지(AuthLayout.tsx·
// public/developed-with-youtube.png와 같은 파일) + 92px 2행 타이틀(각인 효과) + 본문.
// 타이틀 서체는 docs/design/음표 타이포그래피.zip(2a)을 그대로 반영해 Fredoka 500 +
// 일부 글자를 NoteGlyph 음표 SVG로 치환했습니다(N·M·m·p·P) — 나머지 글자는 평범한
// 텍스트 노드입니다. 두 줄의 filter 값은 index.css의 --neu-shadow-hero-title(-hi)
// -filter-1/2 토큰 그대로라 다크모드도 자동으로 따라갑니다.
const LINE1_FILTER =
  "drop-shadow(var(--neu-shadow-hero-title-filter-1)) drop-shadow(var(--neu-shadow-hero-title-filter-2))";
const LINE2_FILTER =
  "drop-shadow(var(--neu-shadow-hero-title-hi-filter-1)) drop-shadow(var(--neu-shadow-hero-title-hi-filter-2))";

export default function LandingHero() {
  return (
    <div className="flex flex-col items-center gap-6.5 pt-6.5 text-center">
      <img
        src="/developed-with-youtube.png"
        alt="Developed with YouTube"
        className="w-40 opacity-85"
      />

      <h1 className="font-['Fredoka'] flex flex-col items-center gap-1 text-[92px] leading-[0.96] font-medium tracking-[-0.015em]">
        <span
          aria-label="Neumorphism"
          style={{
            color: "var(--neu-ink-34-hero)",
            textShadow: "var(--neu-shadow-hero-title)",
          }}
        >
          <span aria-hidden>
            <NoteGlyph letter="N" marginRight="0.05em" filter={LINE1_FILTER} />
            eu
            <NoteGlyph
              letter="m"
              marginLeft="0.03em"
              marginRight="0.04em"
              filter={LINE1_FILTER}
            />
            or
            <NoteGlyph
              letter="p"
              marginLeft="0.04em"
              marginRight="0.04em"
              filter={LINE1_FILTER}
            />
            his
            <NoteGlyph letter="m" marginLeft="0.03em" filter={LINE1_FILTER} />
          </span>
        </span>
        <span
          aria-label="Music Player"
          className="text-neu-hi"
          style={{ textShadow: "var(--neu-shadow-hero-title-hi)" }}
        >
          <span aria-hidden>
            <NoteGlyph letter="M" marginRight="0.05em" filter={LINE2_FILTER} />
            usic{" "}
            <NoteGlyph
              letter="P"
              marginLeft="0.06em"
              marginRight="0.05em"
              filter={LINE2_FILTER}
            />
            layer
          </span>
        </span>
      </h1>

      <p
        className="max-w-140 text-pretty break-keep text-base leading-[1.8]"
        style={{ color: "var(--neu-ink-45)" }}
      >
        눌리고 솟아오르는 물리적인 인터페이스로 음악을 다룹니다. 아티스트와
        제목으로 찾아, 고른 곡을 그 자리에서 재생합니다.
      </p>
    </div>
  );
}
