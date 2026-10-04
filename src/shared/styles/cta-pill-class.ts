// 주 CTA(라벤더 그라디언트 알약) 버튼들이 공유하는 배경·글자색·그림자와 hover/press
// 표현 — 탐색·랜딩의 ActionButton, 탐색 화면의 "태그 추가", 모달의 ModalCtaButton,
// 트랙 상세/재생목록의 44px 재생 버튼(PlayPauseButton). 크기·모양·비활성 표현은
// 자리마다 달라서 호출부가 이어 붙입니다(secondary-button-class.ts와 같은 원칙).
export const ctaPillClass =
  "[background:var(--neu-cta-pill-grad)] text-neu-hi shadow-neu-cta-pill enabled:hover:[background:var(--neu-cta-pill-grad-hover)] enabled:hover:shadow-neu-cta-pill-hover enabled:active:shadow-neu-pill-active";

// 비활성일 때 흐려지는 대신 눌린 듯 가라앉는 표현 — ActionButton과 "태그 추가" 버튼.
export const ctaPillSunkenDisabledClass =
  "disabled:[background:var(--neu-ink-928)] disabled:text-(--neu-ink-58) disabled:shadow-neu-cta-pill-disabled disabled:cursor-default";
