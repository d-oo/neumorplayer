import type { ReactNode } from "react";

// LoginPage/SignupPage가 공유하는 바깥 껍데기(카드 + 배경 글로우 + 브랜드 마크).
export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_circle_at_50%_20%,color-mix(in_srgb,var(--accent)_20%,transparent),transparent_70%)]"
      />
      <div className="relative w-full max-w-95 rounded-2xl border border-border bg-surface px-8 pt-9 pb-8 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)]">
        <div className="mb-7 flex items-center gap-2 text-[15px] font-bold tracking-tight text-text">
          <span
            aria-hidden="true"
            className="h-2 w-2 rounded-full bg-accent shadow-[0_0_12px_2px_color-mix(in_srgb,var(--accent)_70%,transparent)]"
          />
          ytmusic
        </div>
        <h1 className="mb-1.5 text-[22px] font-bold tracking-tight text-text">
          {title}
        </h1>
        {subtitle ? (
          <p className="mb-6 text-sm leading-relaxed text-muted">{subtitle}</p>
        ) : null}
        {children}
        {footer ? (
          <div className="mt-6 text-center text-[13px] text-muted">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
