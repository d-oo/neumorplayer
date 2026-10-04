import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useThemed } from "@/shared/lib/theme";
import { BrandWordmarkStackedLines } from "@/shared/components/BrandWordmark";

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
  const logoShadow = useThemed(
    "7px 7px 16px rgba(142,128,166,0.5), -5px -5px 13px rgba(255,255,255,0.9)",
  );
  return (
    <div className="flex min-h-screen items-center justify-center bg-neu-bg p-6 font-neu text-neu-ink">
      <section className="grid w-full max-w-180.5 grid-cols-[240px_minmax(0,1fr)] gap-10 rounded-[28px] border border-(--neu-border-80) bg-neu-surface px-11.5 py-11 shadow-neu-card">
        <div className="flex flex-col justify-between gap-7">
          <div className="flex flex-col gap-5.5">
            {/* 브랜드 로고 — public/favicon.png(정사각형 원본)를 씁니다. docs/design/
                수정본2.zip(Auth Screens.dc.html)의 "브랜드 로고" 플레이스홀더가 모서리만
                둥근 사각형이라 원형(rounded-full)으로 자르지 마세요. 시안은 132×132에
                radius 26px였지만, 아래 두 줄 워드마크의 글자 폭(오른쪽 끝 기준 101px)에
                가로 길이를 맞추려고 101px로 줄였고 radius도 같은 비율로
                20px로 줄였습니다 — 20px는 Tailwind 기본 radius 스케일에 없는 값이라
                임의값 문법을 그대로 씁니다. */}
            {/* 로고와 워드마크는 둘 다 "/"(비로그인이면 랜딩)로 가는 링크입니다. */}
            <Link to="/" className="self-start">
              <img
                src="/favicon.png"
                alt="neumorplayer"
                className="size-25.25 rounded-[20px] border border-(--neu-border-70) object-cover"
                style={{ boxShadow: logoShadow }}
              />
            </Link>

            <div className="flex flex-col gap-2.5">
              <Link
                to="/"
                className="self-start font-['Space_Grotesk'] text-[27px] leading-[1.1] font-bold whitespace-nowrap text-neu-hi"
                style={{ textShadow: "var(--neu-shadow-wordmark-lg)" }}
              >
                <BrandWordmarkStackedLines />
              </Link>
              <h1 className="text-[22px] leading-[1.1] font-extrabold tracking-[-0.03em]">
                {title}
              </h1>
              <p className="text-[13px] leading-[1.7] text-neu-muted">
                {subtitle}
              </p>
            </div>
          </div>
          {/* 이 패널 하단엔 원래 YouTube 배지(이후 "Powered by YouTube" pill)가
              있었지만, 로그인/회원가입 화면엔 YouTube 콘텐츠가 없어 표기가 필요 없어서
              뺐습니다. */}
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
