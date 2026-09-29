import IconCircleButton from "@/shared/components/IconCircleButton";
import { PauseIcon, PlayIcon, SpinnerIcon } from "@/shared/components/icons";

// 트랙 상세/재생목록 정보의 44px 주 CTA(라벤더 알약 원형) 재생·일시정지 버튼.
// 두 화면이 className은 물론 "재생 중이면 일시정지 아이콘/라벨" 분기까지 똑같이
// 복사해 쓰고 있어서 한 곳으로 모았습니다. 멈춰 있을 때의 라벨만 화면마다 다릅니다
// (트랙 상세는 "재생", 재생목록은 "전체 재생"). 트랙 상세는 현재 곡이면 이 버튼
// 대신 비주얼라이저를 보여주므로 실제로는 항상 playing={false}로만 씁니다.
export default function PlayPauseButton({
  playing,
  loading = false,
  onClick,
  disabled,
  disabledTooltip,
  playLabel = "재생",
}: {
  playing: boolean;
  // 재생을 눌렀지만 아직 실제 재생 전(버퍼링 포함) — CD 플레이어 버튼과 같은 스피너.
  loading?: boolean;
  onClick: () => void;
  disabled?: boolean;
  // 비활성화된 이유를 툴팁으로 알려줄 때(트랙 상세의 재생 불가 곡). 없으면 평소 라벨.
  disabledTooltip?: string;
  playLabel?: string;
}) {
  const label = playing || loading ? "일시정지" : playLabel;

  return (
    <IconCircleButton
      size="xl"
      tooltip={disabled && disabledTooltip ? disabledTooltip : label}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="[background:var(--neu-cta-pill-grad)] text-neu-hi shadow-neu-cta-pill enabled:hover:[background:var(--neu-cta-pill-grad-hover)] enabled:hover:shadow-neu-cta-pill-hover enabled:active:shadow-neu-pill-active"
    >
      {loading ? (
        <SpinnerIcon className="animate-spin" />
      ) : playing ? (
        <PauseIcon />
      ) : (
        <PlayIcon className="ml-0.5" />
      )}
    </IconCircleButton>
  );
}
