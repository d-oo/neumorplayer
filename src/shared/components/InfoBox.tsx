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
      className={`rounded-xl border border-white/70 px-5.5 py-5 text-[13px] text-neu-muted ${className ?? ""}`}
      style={{
        background: "oklch(0.915 0.014 315)",
        boxShadow:
          "inset 3px 3px 7px rgba(150,136,175,0.34), inset -3px -3px 6px rgba(255,255,255,0.85)",
      }}
    >
      {children}
    </div>
  );
}
