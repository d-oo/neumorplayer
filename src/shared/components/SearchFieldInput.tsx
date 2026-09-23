import type { InputHTMLAttributes } from "react";

// 검색창으로 쓰이는 입력창들(탐색 화면의 제목/아티스트/비디오 ID, 헤더의 "라이브러리 내
// 검색", 랜딩 게스트 검색)이 공유하는 <input> 스타일. 감싸는 박스(패딩·라운드·버튼
// 유무)는 화면마다 달라 여기서 건드리지 않고 호출부에 그대로 둡니다.
// line-height를 폰트 크기에 비례하는 기본값 대신 고정 px로 박아 둔 게 핵심입니다 —
// 그렇지 않으면 font-size를 바꿀 때마다 감싸는 박스의 높이(padding + line-height)가
// 같이 흔들립니다. 기본값 23.5px은 헤더/랜딩 검색창 기준이고, 감싸는 박스의 패딩이
// 달라 목표 높이가 다른 탐색 화면 입력창들은 lineHeightPx로 따로 지정합니다(인라인
// style로 넣어야 Tailwind가 생성한 유틸리티 클래스 순서와 무관하게 항상 이깁니다).
export default function SearchFieldInput({
  className,
  style,
  lineHeightPx = 23.5,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { lineHeightPx?: number }) {
  return (
    <input
      {...props}
      style={{ lineHeight: `${lineHeightPx}px`, ...style }}
      className={`min-w-0 flex-1 bg-transparent text-[13px] font-medium text-(--neu-ink-25) outline-none ${className ?? ""}`}
    />
  );
}
