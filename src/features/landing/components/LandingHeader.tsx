import { Link } from "react-router-dom";

// 고정폭이 아니라 내용만큼만 차지하는 최소 너비 헤더 — 좌측 로고마크+워드마크, 우측
// "시작하기"(로그인 화면으로 이동). 로고마크는 favicon-round.png(브랜드 로고)를 그대로
// 씁니다. 워드마크는 AuthLayout.tsx와 같은 Space Grotesk 패턴(크기만 16px).
export default function LandingHeader() {
  return (
    <header
      className="flex w-fit max-w-full items-center gap-5 self-center rounded-[22px] border border-white/80 py-3 pr-3.5 pl-5.5"
      style={{
        background: "oklch(0.935 0.013 315)",
        boxShadow:
          "12px 12px 26px rgba(142,128,166,0.45), -6px -6px 14px rgba(255,255,255,0.7)",
      }}
    >
      <div className="flex items-center gap-3">
        <img
          src="/favicon-round.png"
          alt="Neumorplayer"
          className="h-8.5 w-8.5 flex-none rounded-full object-cover"
          style={{
            boxShadow:
              "3px 3px 8px rgba(146,132,170,0.5), -2px -2px 6px rgba(255,255,255,0.95)",
          }}
        />
        <div
          className="font-['Space_Grotesk'] text-base font-bold tracking-[-0.01em] text-[#6d1a9f]"
          style={{
            textShadow:
              "1px 1px 1.5px rgba(120,96,150,0.5), -1px -1px 1.5px rgba(255,255,255,0.95)",
          }}
        >
          NEUMORPLAYER
        </div>
      </div>

      <Link
        to="/login"
        className="rounded-[13px] px-5.5 py-2.75 text-[13px] font-bold text-[#6d1a9f] shadow-neu-header-cta active:shadow-neu-header-cta-active"
        style={{ background: "var(--neu-cta-pill-grad)" }}
      >
        시작하기
      </Link>
    </header>
  );
}
