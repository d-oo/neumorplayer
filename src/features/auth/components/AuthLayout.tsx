import type { ReactNode } from "react";

// LoginPage/SignupPage가 공유하는 바깥 껍데기(브랜드 패널 + 폼 패널 카드).
// docs/design/의 "데스크탑 로그인 및 회원가입 화면" 시안을 그대로 옮겼습니다 — 값을
// 바꾸기 전에 그 zip(auth_screens/Auth Screens.dc.html)을 먼저 확인하세요.
export default function AuthLayout({
  title,
  subtitle,
  heading,
  children,
  footer,
}: {
  title: ReactNode;
  subtitle: ReactNode;
  heading: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neu-bg p-6 font-neu text-neu-ink">
      <section className="grid w-full max-w-203 grid-cols-[286px_minmax(0,1fr)] gap-11 rounded-[28px] border border-white/80 bg-neu-surface px-11.5 py-11 shadow-neu-card">
        <div className="flex flex-col justify-between gap-7">
          <div className="flex flex-col gap-5.5">
            {/* 브랜드 로고 — public/favicon.png(정사각형 원본)를 둥글게 잘라 씁니다. */}
            <img
              src="/favicon.png"
              alt="neumorplayer"
              className="size-33 rounded-full border border-white/70 object-cover"
              style={{
                boxShadow:
                  "7px 7px 16px rgba(142,128,166,0.5), -5px -5px 13px rgba(255,255,255,0.9)",
              }}
            />

            <div className="flex flex-col gap-2.5">
              <h1 className="text-3xl leading-[1.1] font-extrabold tracking-[-0.04em]">
                {title}
              </h1>
              <p className="text-[13px] leading-[1.7] text-neu-muted">
                {subtitle}
              </p>
            </div>
          </div>

          <div className="font-neu-mono text-[10px] tracking-[0.16em] text-[oklch(0.55_0.02_315)]">
            Youtube Music Player
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="text-[15px] font-extrabold tracking-[-0.02em]">
            {heading}
          </div>
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
