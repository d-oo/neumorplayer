import { useRef, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { CaretIcon, LogoutIcon, SettingsIcon } from "@/shared/components/icons";
import { useOutsideClick } from "@/shared/lib/useOutsideClick";
import SettingsModal from "./SettingsModal";

// docs/design/수정사항.zip(03) — 헤더 우측 상단의 프로필 아바타를 드롭다운 버튼으로
// 바꾼 것. 로그아웃 버튼은 화면(HomeLayout)이 다르더라도 여전히 auth가 소유하는
// 기능이라(docs/feature-conventions.md) 이 컴포넌트도 auth에 둡니다.
export default function ProfileDropdown() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useOutsideClick(containerRef, () => setOpen(false), open);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex flex-none items-center gap-2 rounded-full border border-(--neu-border-80) py-1.25 pr-2.75 pl-1.5 [background:var(--neu-ink-915)] transition-[background,box-shadow] duration-150 hover:[background:var(--neu-hover-tint-grad)]"
        style={{
          boxShadow: open
            ? "var(--neu-shadow-profile-open)"
            : "var(--neu-shadow-tint-pill)",
        }}
      >
        <div
          className="h-6 w-6 rounded-full border border-(--neu-border-85) bg-neu-accent-tint"
          style={{ boxShadow: "var(--neu-shadow-avatar-chip)" }}
        />
        <CaretIcon open={open} className="flex-none text-(--neu-ink-50-a)" />
      </button>

      {open && (
        <div className="absolute top-11.5 right-0 z-20 w-56 rounded-[14px] border border-(--neu-border-85) bg-neu-surface p-2 shadow-neu-dropdown">
          <div className="px-3.5 pt-2.25 pb-2.75">
            <p
              title={user?.email}
              className="truncate text-[12.5px] font-semibold text-(--neu-ink-34)"
            >
              {user?.email}
            </p>
          </div>
          <div className="mx-1.5 mb-1.5 h-px bg-(--neu-shc-142-26)" />
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setSettingsOpen(true);
            }}
            className="flex w-full items-center gap-2.5 rounded-[10px] px-3.5 py-2.5 text-left text-[13.5px] font-semibold text-(--neu-ink-32) transition-[background,box-shadow] duration-150 hover:bg-neu-highlight hover:text-neu-hi hover:shadow-neu-highlight"
          >
            <SettingsIcon className="flex-none" />
            설정
          </button>
          <button
            type="button"
            onClick={() => void signOut()}
            className="flex w-full items-center gap-2.5 rounded-[10px] px-3.5 py-2.5 text-left text-[13.5px] font-semibold text-(--neu-ink-32) transition-[background,box-shadow] duration-150 hover:bg-neu-highlight hover:text-neu-hi hover:shadow-neu-highlight"
          >
            <LogoutIcon className="flex-none" />
            로그아웃
          </button>
        </div>
      )}

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
