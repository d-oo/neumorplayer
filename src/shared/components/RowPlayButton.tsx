import { PlayIcon } from "./icons";

// 목록 행(라이브러리, 헤더 검색 결과)의 원형 재생 버튼. 부모가 grid/flex 어느 쪽이든
// 마지막 칸에 붙는 위치 지정(justify-self-end / flex-none)만 className으로 넘기면
// 됩니다.
export default function RowPlayButton({
  onClick,
  label,
  className,
}: {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`grid h-7 w-7 place-items-center rounded-full bg-neu-surface text-neu-hi shadow-neu-raised-sm ${className ?? ""}`}
    >
      <PlayIcon className="ml-0.5" />
    </button>
  );
}
