import type { ButtonHTMLAttributes, ReactNode } from "react";

// 모달 하단의 주 버튼(AddToPlaylistButton의 "추가", PrivacyPolicyModal의 "닫기")이
// 공유하는 라벤더 알약 CTA. 탐색 화면의 ActionButton과는 배경·그림자 토큰만 같고
// 크기(px-6 py-2.75 / text-sm)가 달라 별도 컴포넌트로 둡니다.
export default function ModalCtaButton({
  children,
  ...props
}: { children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className="rounded-full px-5 py-2.25 text-[13px] font-bold text-neu-hi [background:var(--neu-cta-pill-grad)] shadow-neu-cta-pill enabled:hover:[background:var(--neu-cta-pill-grad-hover)] enabled:hover:shadow-neu-cta-pill-hover enabled:active:shadow-neu-pill-active disabled:cursor-default disabled:opacity-60"
      {...props}
    >
      {children}
    </button>
  );
}
