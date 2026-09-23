import MarqueeText from "./MarqueeText";

// CD 플레이어 카드(대시보드 PlayerPanel / 랜딩 LandingCdPlayer)의 곡 제목 + 부제.
// 부제만 소유자가 달라서(대시보드는 아티스트, 랜딩은 채널명) prop으로 받습니다.
export default function NowPlayingTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="min-w-0 flex-1">
      <MarqueeText
        text={title}
        className="text-xl font-extrabold tracking-[-0.035em] text-neu-ink"
      />
      <div className="mt-1.25 truncate text-[12.5px] text-neu-muted">
        {subtitle}
      </div>
    </div>
  );
}
