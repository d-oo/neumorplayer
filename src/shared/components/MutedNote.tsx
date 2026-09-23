import type { ReactNode } from "react";

// 목록 안이나 페이지 상단에 한 줄로 조용히 놓는 안내문(로딩 중, 조회 실패, 빈 목록).
// 이 앱엔 같은 목적의 표시가 두 가지 있는데, 자리에 따라 골라 쓰면 됩니다:
//
// - MutedNote — 사이드바 카드 안, 트랙 목록 아래처럼 좁거나 이미 카드 안인 자리.
//   배경 없이 글자만 흐리게 둡니다. 여백은 자리마다 달라서 className으로 받습니다.
// - InfoBox — 본문 한가운데의 빈 결과처럼 "여기 아무것도 없다"를 분명히 보여줘야
//   하는 자리. 테두리 + 함몰 배경 박스라 시선을 잡습니다.
//
// 좁은 자리에 InfoBox를 쓰면 카드 안에 또 박스가 생겨 답답해지므로 섞지 마세요.
export default function MutedNote({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={`text-sm text-neu-muted ${className ?? ""}`}>{children}</p>
  );
}
