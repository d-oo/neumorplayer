import MarqueeText from "@/shared/components/MarqueeText";

// CD 플레이어 카드(대시보드 PlayerPanel / 랜딩 LandingCdPlayer)의 곡 제목 + 부제.
// 둘 다 넘치면 마퀴로 흘립니다.
// 부제만 소유자가 달라서(대시보드는 아티스트, 랜딩은 채널명) prop으로 받습니다.
// 곡이 없으면(title/subtitle이 undefined) 두 플레이어 모두 같은 안내 문구를 보여주도록
// 그 문구를 여기에 둡니다.
export default function NowPlayingTitle({
  title = "Play your music",
  subtitle = "Sound is beautiful",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="min-w-0 flex-1">
      <MarqueeText
        text={title}
        className="text-xl font-extrabold tracking-[-0.035em] text-neu-ink"
      />
      <MarqueeText
        text={subtitle}
        className="mt-1.25 text-[12.5px] text-neu-muted"
      />
    </div>
  );
}
