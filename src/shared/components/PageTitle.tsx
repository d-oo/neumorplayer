import type { ReactNode } from "react";

// 본문 페이지 맨 위의 큰 제목(라이브러리, 헤더 검색 결과, 탐색). 아래 여백은 페이지마다
// 달라서 className으로 받습니다.
export default function PageTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h1
      className={`text-[26px] font-extrabold tracking-[-0.035em] text-neu-ink ${className ?? ""}`}
    >
      {children}
    </h1>
  );
}
