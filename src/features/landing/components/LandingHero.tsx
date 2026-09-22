// 1236px 폭(부모가 배치), 가운데 정렬. 배지 + 92px 2행 타이틀(각인 효과) + 본문.
export default function LandingHero() {
  return (
    <div className="flex flex-col items-center gap-6.5 pt-6.5 text-center">
      <div
        className="flex items-center gap-2.25 rounded-full border border-white/70 py-2 pr-4 pl-2.5"
        style={{
          background: "oklch(0.908 0.014 315)",
          boxShadow:
            "inset 3px 3px 7px rgba(150,136,175,0.38), inset -3px -3px 6px rgba(255,255,255,0.88)",
        }}
      >
        <span
          className="flex h-3.5 w-5 flex-none items-center justify-center rounded"
          style={{ background: "#6d1a9f" }}
        >
          <svg width="7" height="8" viewBox="0 0 8 9" aria-hidden>
            <polygon points="0,0 8,4.5 0,9" fill="white" />
          </svg>
        </span>
        <span className="font-neu-mono text-[11px] tracking-[0.16em] text-[oklch(0.46_0.025_315)]">
          POWERED BY YOUTUBE
        </span>
      </div>

      <h1 className="font-['Space_Grotesk'] flex flex-col items-center gap-1 text-[92px] leading-[0.96] font-bold tracking-[-0.045em]">
        <span
          style={{
            color: "oklch(0.34 0.03 315)",
            textShadow:
              "2px 2px 3px rgba(255,255,255,0.95), -2px -2px 4px rgba(128,108,158,0.45)",
          }}
        >
          Neumorphism
        </span>
        <span
          className="text-[#6d1a9f]"
          style={{
            textShadow:
              "2px 2px 3px rgba(255,255,255,0.95), -2px -2px 4px rgba(128,108,158,0.5)",
          }}
        >
          Music Player
        </span>
      </h1>

      <p
        className="max-w-[560px] text-pretty break-keep text-base leading-[1.8]"
        style={{ color: "oklch(0.45 0.025 315)" }}
      >
        눌리고 솟아오르는 물리적인 인터페이스로 음악을 다룹니다. 아티스트와
        제목으로 찾아, 고른 곡을 그 자리에서 재생합니다.
      </p>
    </div>
  );
}
