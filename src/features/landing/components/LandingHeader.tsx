import { Link } from "react-router-dom";

// 886px 헤더 — 좌측 로고마크+워드마크, 우측 "시작하기"(로그인 화면으로 이동).
// 로고마크는 CD 플레이어의 CdDisc(features/player)와 같은 그라디언트 언어를 쓰지만
// 166px용 절대픽셀 스택을 34px로 그대로 줄이면 값이 깨져서 34px 전용으로 새로
// 작성했습니다. 워드마크는 AuthLayout.tsx와 같은 Space Grotesk 패턴(크기만 16px).
export default function LandingHeader() {
  return (
    <header
      className="flex w-221.5 max-w-full items-center justify-between self-center rounded-[22px] border border-white/80 py-3 pr-3.5 pl-5.5"
      style={{
        background: "oklch(0.935 0.013 315)",
        boxShadow:
          "12px 12px 26px rgba(142,128,166,0.45), -6px -6px 14px rgba(255,255,255,0.7)",
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="h-8.5 w-8.5 flex-none rounded-full"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, oklch(0.935 0.013 315) 0 5px, transparent 5px 6px), conic-gradient(from 210deg, rgba(255,255,255,0.9), rgba(255,255,255,0) 30%, rgba(255,255,255,0.7) 55%, rgba(255,255,255,0) 80%, rgba(255,255,255,0.9)), linear-gradient(150deg, rgba(179,68,255,0.18), transparent 70%), oklch(0.905 0.014 315)",
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
