// 주 CTA가 아닌 "보조" 버튼들이 공유하는 클래스. 두 모양 다 색상·크기는 자리마다
// 달라서 호출부가 이어 붙이고, 여기엔 모든 호출부가 똑같이 쓰던 것만 둡니다 —
// 패딩·글자 크기·글자 색을 여기 넣으면 호출부의 같은 계열 클래스와 충돌해서 어느
// 쪽이 이길지 클래스 순서가 아니라 Tailwind의 출력 순서에 좌우됩니다.

// 재생목록 정보/트랙 상세의 "셔플·수정·삭제" 보조 44px 원형 버튼.
export const secondaryCircleButtonClass =
  "bg-neu-surface border border-[var(--neu-border-85)] shadow-neu-pill-secondary active:shadow-neu-pill-active";

// 모달의 "취소", 배너의 "자세히 보기", 설정의 "회원탈퇴" 같은 보조 알약 버튼.
export const secondaryPillButtonClass =
  "rounded-full border border-[var(--neu-border-85)] font-semibold shadow-neu-pill-secondary active:shadow-neu-pill-active";
