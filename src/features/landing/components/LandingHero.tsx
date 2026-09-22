// 1236px 폭(부모가 배치), 가운데 정렬. "Developed with YouTube" 배지(AuthLayout.tsx·
// public/developed-with-youtube.png와 같은 파일) + 92px 2행 타이틀(각인 효과) + 본문.
export default function LandingHero() {
  return (
    <div className="flex flex-col items-center gap-6.5 pt-6.5 text-center">
      <img
        src="/developed-with-youtube.png"
        alt="Developed with YouTube"
        className="w-40 opacity-85"
      />

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
        className="max-w-140 text-pretty break-keep text-base leading-[1.8]"
        style={{ color: "oklch(0.45 0.025 315)" }}
      >
        눌리고 솟아오르는 물리적인 인터페이스로 음악을 다룹니다. 아티스트와
        제목으로 찾아, 고른 곡을 그 자리에서 재생합니다.
      </p>
    </div>
  );
}
