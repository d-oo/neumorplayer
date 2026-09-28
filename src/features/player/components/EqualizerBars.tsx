import { usePlayerStore } from "../lib/usePlayerStore";
import { selectIsAudible } from "../lib/playback-display";

// "지금 재생 중인 곡" 표시용 막대 이퀄라이저 — 시안 그대로 막대마다 주기와 시작
// 지연이 달라서 서로 어긋나게 흔들립니다(@keyframes neu-eq, src/index.css).
// 트랙 목록 행의 재생시간 칸(DurationPlayButton)이 현재 곡일 때 이걸 보여줍니다.
const EQ_BAR_ANIMATIONS = [
  "neu-eq 0.72s ease-in-out infinite alternate",
  "neu-eq 0.55s ease-in-out 0.1s infinite alternate",
  "neu-eq 0.86s ease-in-out 0.22s infinite alternate",
];

// 일시정지 중에는 old-src PlayingMotion처럼 animation-play-state를 paused로 바꿔
// 막대를 그 자리에서 멈추고, 다시 재생하면 멈춘 지점부터 이어서 움직입니다. 인라인
// animation 단축 속성이 play-state까지 덮어쓰므로 별도 클래스가 아니라 단축 속성
// 문자열 끝에 붙입니다(애니메이션 이름이 그대로라 처음부터 다시 시작하지 않음).
// 재생 버튼 아이콘·CD 회전과 같은 selectIsAudible을 봐서 버퍼링 중에도 함께 멈춥니다.
// 곡을 막 바꾼 직후 실제 재생 이벤트가 오기 전에도 잠깐 멈춰 있는데, old-src도 같은
// 동작이었습니다.
//
// size: sm은 목록 행의 재생시간 칸용(14px 높이), lg는 곡 정보 페이지의 44px 재생
// 버튼 자리용(20px 높이 — 칸 자체는 호출부가 size-11로 잡음).
const SIZES = {
  sm: { box: "h-3.5 gap-0.5", bar: "w-0.75 rounded-xs" },
  lg: { box: "h-5 gap-1", bar: "w-1 rounded-sm" },
} as const;

export default function EqualizerBars({
  size = "sm",
  className,
}: {
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const isAudible = usePlayerStore(selectIsAudible);
  const playState = isAudible ? "running" : "paused";

  return (
    <span className={`flex items-end ${SIZES[size].box} ${className ?? ""}`}>
      {EQ_BAR_ANIMATIONS.map((animation) => (
        <span
          key={animation}
          className={`bg-neu-accent-light ${SIZES[size].bar}`}
          style={{ animation: `${animation} ${playState}` }}
        />
      ))}
    </span>
  );
}
