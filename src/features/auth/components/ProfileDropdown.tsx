import { useEffect, useRef, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { CaretIcon, LogoutIcon, SettingsIcon } from "@/shared/components/icons";

// docs/design/수정사항.zip(03) — 헤더 우측 상단의 프로필 아바타를 드롭다운 버튼으로
// 바꾼 것. 로그아웃 버튼은 화면(HomeLayout)이 다르더라도 여전히 auth가 소유하는
// 기능이라(docs/feature-conventions.md) 이 컴포넌트도 auth에 둡니다.
// AddToPlaylistButton.tsx의 outside-click 패턴을 그대로 재사용합니다.
//
// "설정" 항목은 아직 이동할 라우트/화면이 없어 시각적으로만 넣었습니다(onClick 없음,
// docs/todos.md 참고).
export default function ProfileDropdown() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex flex-none items-center gap-2 rounded-full border border-white/80 py-1.25 pr-2.75 pl-1.5 [background:oklch(0.915_0.014_315)] transition-[background,box-shadow] duration-150 hover:[background:var(--neu-hover-tint-grad)]"
        style={{
          boxShadow: open
            ? "var(--neu-shadow-profile-open)"
            : "var(--neu-shadow-tint-pill)",
        }}
      >
        <div
          className="h-6 w-6 rounded-full border border-white/85 bg-neu-accent-tint"
          style={{
            boxShadow:
              "inset 3px 3px 6px rgba(150,136,175,0.45), inset -2px -2px 5px rgba(255,255,255,0.9)",
          }}
        />
        <CaretIcon open={open} className="flex-none text-[oklch(0.5_0.025_315)]" />
      </button>

      {open && (
        <div className="absolute top-11.5 right-0 z-20 w-56 rounded-[14px] border border-white/85 bg-neu-surface p-2 shadow-neu-dropdown">
          <div className="px-3.5 pt-2.25 pb-2.75">
            <p
              title={user?.email}
              className="truncate text-[12.5px] font-semibold text-[oklch(0.34_0.025_315)]"
            >
              {user?.email}
            </p>
          </div>
          <div className="mx-1.5 mb-1.5 h-px bg-[rgba(142,128,166,0.26)]" />
          <button
            type="button"
            className="flex w-full items-center gap-2.5 rounded-[10px] px-3.5 py-2.5 text-left text-[13.5px] font-semibold text-[oklch(0.32_0.025_315)] transition-[background,box-shadow] duration-150 hover:bg-neu-highlight hover:text-neu-hi hover:shadow-neu-highlight"
          >
            <SettingsIcon className="flex-none" />
            설정
          </button>
          <button
            type="button"
            onClick={() => void signOut()}
            className="flex w-full items-center gap-2.5 rounded-[10px] px-3.5 py-2.5 text-left text-[13.5px] font-semibold text-[oklch(0.32_0.025_315)] transition-[background,box-shadow] duration-150 hover:bg-neu-highlight hover:text-neu-hi hover:shadow-neu-highlight"
          >
            <LogoutIcon className="flex-none" />
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}
