import type { ReactNode } from "react";

// 트랙/재생목록 썸네일이 공통으로 쓰는 테두리·모서리·그림자 박스. 실제 이미지(또는
// PlaylistCoverGrid의 2x2 콜라주)는 children으로 넘기고, 이 컴포넌트는 크기별 chrome만
// 책임집니다 — 라이브러리/재생목록 상세/헤더 검색 결과/사이드바 "다음 트랙"·"재생목록"
// 탭이 전부 같은 값을 복붙하고 있던 걸 여기로 모았습니다.
const SIZES = {
  row: "h-8.5 w-15",
  rowLg: "h-8.75 w-15.5",
  queue: "h-8 w-14",
} as const;

const SHADOW =
  "3px 3px 8px rgba(150,136,175,0.42), -2px -2px 6px rgba(255,255,255,0.92)";

export default function ThumbBox({
  size,
  children,
  className,
}: {
  size: keyof typeof SIZES;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`${SIZES[size]} flex-none overflow-hidden rounded-md border border-white/70 ${className ?? ""}`}
      style={{ boxShadow: SHADOW }}
    >
      {children}
    </div>
  );
}
