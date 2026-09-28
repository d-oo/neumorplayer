import type { ReactNode } from "react";
import { useThemed } from "@/shared/lib/theme";

// 트랙/재생목록 썸네일이 공통으로 쓰는 테두리·모서리·그림자 박스. 실제 이미지(또는
// PlaylistCoverGrid의 2x2 콜라주)는 children으로 넘기고, 이 컴포넌트는 chrome만
// 책임집니다 — 라이브러리/재생목록 상세/헤더 검색 결과/사이드바 "재생 트랙"·"재생목록"
// 탭이 전부 같은 값을 복붙하고 있던 걸 여기로 모았습니다.
//
// 크기는 한 가지(바깥 66×38)입니다. 1px 테두리 안쪽, 즉 이미지가 실제로 보이는
// 영역이 정확히 64×36(16:9)이 되도록 맞춘 값이라 — YouTube 썸네일(mqdefault 320×180)이
// object-cover로 잘리지 않습니다 — 바깥 크기만 보고 반올림하지 마세요.
const SIZE = "h-9.5 w-16.5";

const SHADOW =
  "3px 3px 8px rgba(150,136,175,0.42), -2px -2px 6px rgba(255,255,255,0.92)";

export default function ThumbBox({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const shadow = useThemed(SHADOW);
  return (
    <div
      className={`${SIZE} flex-none overflow-hidden rounded-md border border-(--neu-border-70) ${className ?? ""}`}
      style={{ boxShadow: shadow }}
    >
      {children}
    </div>
  );
}
