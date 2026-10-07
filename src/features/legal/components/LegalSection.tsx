import type { ReactNode } from "react";

// 약관·방침 본문(PrivacyPolicyContent/TermsContent)이 같은 모양으로 쓰는 조각들.

// 번호 붙은 제목 한 줄 + 본문(문단이나 LegalList).
export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-1.5">
      <p className="font-bold text-neu-ink">{title}</p>
      {children}
    </section>
  );
}

export function LegalList({ children }: { children: ReactNode }) {
  return <ul className="list-disc space-y-1 pl-4.5">{children}</ul>;
}

// 본문 안의 외부 문서 링크(Google 개인정보처리방침, YouTube 서비스 약관 등) — 항상 새
// 탭으로 엽니다. mailto: 링크도 같은 모양으로 씁니다.
export function LegalLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-semibold text-neu-hi underline"
    >
      {children}
    </a>
  );
}
