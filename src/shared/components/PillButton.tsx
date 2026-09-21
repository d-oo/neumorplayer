import type { ButtonHTMLAttributes, ReactNode } from "react";

// 아이콘 + 텍스트 알약 버튼(MusicInfoPage의 "재생", AddToPlaylistButton의 pill
// variant가 공유). `pressed`는 AddToPlaylistButton처럼 토글 상태를 색으로 표시해야
// 하는 경우에만 쓰고, 나머지 버튼 속성(onClick, aria-pressed, disabled 등)은 그대로
// 통과시킵니다.
export default function PillButton({
  icon,
  children,
  pressed,
  className,
  ...buttonProps
}: {
  icon: ReactNode;
  children: ReactNode;
  pressed?: boolean;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`flex items-center gap-2 rounded-full bg-neu-surface px-4 py-2 text-sm font-bold shadow-neu-raised-sm ${
        pressed ? "text-[#7b1fb0]" : "text-neu-hi"
      } ${className ?? ""}`}
      {...buttonProps}
    >
      {icon}
      {children}
    </button>
  );
}
