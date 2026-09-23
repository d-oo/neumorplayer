import type { ReactNode } from "react";

// LoginPage/SignupPage가 공유하는 바깥 껍데기(브랜드 패널 + 폼 패널 카드).
// docs/design/의 "데스크탑 로그인 및 회원가입 화면" 시안을 옮긴 뒤, docs/design/
// 수정본2.zip(Auth Screens.dc.html, 3a/3b)의 카드 치수·워드마크·배지 이미지로
// 갱신했습니다 — 값을 바꾸기 전에 그 zip을 먼저 확인하세요.
// 예전엔 폼 패널 위에 작은 라벨을 보여주는 heading prop도 받았지만, 그 역할을 지금은
// 브랜드 패널의 title이 대신하고 있습니다 — 인증 화면을 더 추가할 때 heading을
// 다시 들여오지 마세요.
export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: ReactNode;
  subtitle: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neu-bg p-6 font-neu text-neu-ink">
      <section className="grid w-full max-w-180.5 grid-cols-[240px_minmax(0,1fr)] gap-10 rounded-[28px] border border-white/80 bg-neu-surface px-11.5 py-11 shadow-neu-card">
        <div className="flex flex-col justify-between gap-7">
          <div className="flex flex-col gap-5.5">
            {/* 브랜드 로고 — public/favicon.png(정사각형 원본)를 씁니다. docs/design/
                수정본2.zip(Auth Screens.dc.html)의 "브랜드 로고 132×132" 플레이스홀더가
                모서리만 둥근 사각형(border-radius: 26px)이라 원형(rounded-full)으로
                자르지 마세요 — 26px는 Tailwind 기본 radius 스케일에 없는 값이라
                임의값 문법을 그대로 씁니다. */}
            <img
              src="/favicon.png"
              alt="neumorplayer"
              className="size-33 rounded-[26px] border border-white/70 object-cover"
              style={{
                boxShadow:
                  "7px 7px 16px rgba(142,128,166,0.5), -5px -5px 13px rgba(255,255,255,0.9)",
              }}
            />

            <div className="flex flex-col gap-2.5">
              <div
                className="font-['Space_Grotesk'] text-[27px] leading-[1.1] font-bold tracking-[-0.015em] whitespace-nowrap text-neu-hi"
                style={{
                  textShadow:
                    "1px 1px 1.5px rgba(120,96,150,0.55), -1px -1px 1.5px rgba(255,255,255,0.95)",
                }}
              >
                NEUMORPLAYER
              </div>
              <h1 className="text-[22px] leading-[1.1] font-extrabold tracking-[-0.03em]">
                {title}
              </h1>
              <p className="text-[13px] leading-[1.7] text-neu-muted">
                {subtitle}
              </p>
            </div>
          </div>

          <img
            src="/developed-with-youtube.png"
            alt="Developed with YouTube"
            className="w-40 opacity-85"
          />
        </div>

        <div className="flex flex-col gap-4">
          {children}
          {footer ? (
            <div className="pt-0.5 text-center text-[12.5px] text-neu-muted">
              {footer}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
