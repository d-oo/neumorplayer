import type { ReactNode } from "react";

// 빈 상태/로딩/에러 메시지를 보여주는 박스(ExplorePage의 "검색 결과 없음",
// LibraryPage의 로딩/에러). margin 유틸만 호출부마다 달라서 className으로 받습니다.
export default function InfoBox({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-(--neu-border-70) px-5.5 py-5 text-[13px] text-neu-muted ${className ?? ""}`}
      style={{
        background: "var(--neu-ink-915)",
        boxShadow: "var(--neu-shadow-sunken-panel)",
      }}
    >
      {children}
    </div>
  );
}
