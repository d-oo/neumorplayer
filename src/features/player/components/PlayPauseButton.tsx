import IconCircleButton from "@/shared/components/IconCircleButton";
import { PauseIcon, PlayIcon } from "@/shared/components/icons";

// 트랙 상세/재생목록 정보의 44px 주 CTA(라벤더 알약 원형) 재생·일시정지 버튼.
// 두 화면이 className은 물론 "재생 중이면 일시정지 아이콘/라벨" 분기까지 똑같이
// 복사해 쓰고 있어서 한 곳으로 모았습니다. 멈춰 있을 때의 라벨만 화면마다 다릅니다
// (트랙 상세는 "재생", 재생목록은 "전체 재생").
export default function PlayPauseButton({
  playing,
  onClick,
  disabled,
  playLabel = "재생",
}: {
  playing: boolean;
  onClick: () => void;
  disabled?: boolean;
  playLabel?: string;
}) {
  const label = playing ? "일시정지" : playLabel;

  return (
    <IconCircleButton
      size="xl"
      tooltip={label}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="[background:var(--neu-cta-pill-grad)] text-neu-hi shadow-neu-cta-pill enabled:hover:[background:var(--neu-cta-pill-grad-hover)] enabled:hover:shadow-neu-cta-pill-hover enabled:active:shadow-neu-pill-active"
    >
      {playing ? <PauseIcon /> : <PlayIcon className="ml-0.5" />}
    </IconCircleButton>
  );
}
