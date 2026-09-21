import type { ButtonHTMLAttributes, ReactNode } from "react";

// 원형 아이콘 버튼(라이브러리/검색결과 행의 재생 버튼, QueueCard의 재생목록 추가,
// PlayerPanel의 이전/다음/셔플/반복, AddToPlaylistButton의 아이콘 트리거, 재생목록
// 정보·트랙 상세의 44px 액션 버튼)이 공유하는 크기·모양(rounded-full/bg-neu-surface)과
// disabled 흐림만 책임집니다. 색상·그림자·hover/active/눌림 표현은 자리마다 의미가
// 달라서(예: 눌렸을 때 그림자까지 sunken으로 바뀌는 곳도 있고 색만 바뀌는 곳도 있음)
// prop으로 만들지 않고 className/style로 그대로 받습니다 — PillButton의 `pressed`처럼
// 의미가 완전히 같을 때만 prop화합니다.
const SIZES = {
  sm: "h-7 w-7",
  md: "h-7.5 w-7.5",
  lg: "h-9.5 w-9.5",
  xl: "h-11 w-11",
} as const;

export default function IconCircleButton({
  size,
  tooltip,
  children,
  className,
  ...buttonProps
}: {
  size: keyof typeof SIZES;
  // 재생목록 정보/트랙 상세의 44px 버튼 행이 필요로 하는 hover 툴팁(위쪽에 뜨는
  // 어두운 라벨). 없으면 기존처럼 <button> 하나만 렌더링해서 툴팁이 필요 없는
  // 나머지 호출부는 영향받지 않습니다.
  tooltip?: string;
  children: ReactNode;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const button = (
    <button
      type="button"
      className={`grid ${SIZES[size]} place-items-center rounded-full bg-neu-surface disabled:opacity-40 ${className ?? ""}`}
      {...buttonProps}
    >
      {children}
    </button>
  );

  if (!tooltip) return button;

  return (
    <div className="group relative">
      {button}
      <span
        className="pointer-events-none absolute bottom-full left-1/2 mb-2.25 -translate-x-1/2 rounded-lg bg-[rgba(28,14,40,0.9)] px-2.5 py-1.5 text-[11.5px] font-semibold whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100"
        style={{ boxShadow: "0 6px 16px rgba(40,20,60,0.35)" }}
      >
        {tooltip}
      </span>
    </div>
  );
}
