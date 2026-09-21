// "검색"/"추가"가 공유하는 알약 모양 CTA 버튼 — docs/design/ 시안의 "추가" 버튼
// 스타일 그대로입니다. 활성 상태일 때만 라벤더 그라디언트 + 보라색 글자로 강조되고,
// 비활성 상태는 눌린 듯한 sunken 그림자로 가라앉습니다. shared/components/PillButton은
// 아이콘+토글 색상 버튼이라 이 활성/비활성 CTA와는 다른 컴포넌트입니다.
//
// 배경/그림자를 예전엔 enabled 여부로 분기한 인라인 style 객체로 지정했지만,
// docs/design/수정사항.zip(02)의 hover 효과를 추가하면서 AuthForm.tsx의
// PrimaryButton과 같은 방식(색/그림자를 index.css의 이름 붙은 CSS 변수 + Tailwind
// enabled:/disabled: 클래스로 표현)으로 바꿨습니다 — 인라인 style은 어떤 클래스보다
// 항상 이겨서, 인라인으로 계속 지정하면 enabled:hover:.../enabled:active:... 클래스가
// 죽은 코드가 됩니다(실제로 이 버튼의 active:shadow-neu-pill-active가 그런
// 상태였습니다). 이 배경/그림자 값은 재생목록 정보·트랙 상세의 "재생" 버튼과도
// 동일해서(docs/design/수정본2.zip) 토큰 이름이 --neu-cta-pill-*(범용)입니다.
export default function ActionButton({
  label,
  enabled,
  onClick,
}: {
  label: string;
  enabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!enabled}
      className="rounded-full px-6 py-2.75 text-sm font-bold whitespace-nowrap transition-[background,box-shadow] duration-150 [background:var(--neu-cta-pill-grad)] text-neu-hi shadow-neu-cta-pill enabled:hover:[background:var(--neu-cta-pill-grad-hover)] enabled:hover:shadow-neu-cta-pill-hover enabled:active:shadow-neu-pill-active disabled:[background:oklch(0.928_0.013_315)] disabled:text-[oklch(0.58_0.02_315)] disabled:shadow-neu-cta-pill-disabled disabled:cursor-default"
    >
      {label}
    </button>
  );
}
