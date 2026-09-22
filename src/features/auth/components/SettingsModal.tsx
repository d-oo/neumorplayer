import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { deleteAccount } from "../api/account";
import Modal from "@/shared/components/Modal";
import { MoonIcon, SunIcon } from "@/shared/components/icons";
import { sunkenPanelStyle } from "@/shared/styles/sunken-panel-style";
import { segmentTabStyle } from "@/shared/styles/segment-tab-style";

// ProfileDropdown의 "설정" 메뉴가 여는 모달(docs/todos.md 항목 처리). 테마 선택은
// 아직 실제 다크모드 구현이 없어 선택 상태만 로컬로 바꾸는 UI 껍데기다 — 적용도,
// 새로고침 후 유지도 안 한다(실제 구현은 별도 작업으로 docs/todos.md에 남겨둠).
// 회원탈퇴는 docs/todos.md의 "회원 탈퇴(계정+데이터 삭제)" 항목대로 확인 단계를
// 거쳐 /api/account-delete를 호출한다.
export default function SettingsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { signOut } = useAuth();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: async () => {
      await signOut();
      handleClose();
    },
  });

  function handleClose() {
    setConfirmingDelete(false);
    deleteMutation.reset();
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} className="w-93 px-5.5 pt-5.5 pb-5">
      {confirmingDelete ? (
        <>
          <div>
            <p className="text-base font-extrabold tracking-[-0.02em]">
              정말 탈퇴하시겠어요?
            </p>
            <p className="mt-1.25 text-[12.5px] text-neu-muted">
              계정과 저장된 트랙·재생목록이 모두 삭제되며 되돌릴 수 없습니다.
            </p>
          </div>

          {deleteMutation.isError && (
            <p className="text-xs text-red-500">
              {deleteMutation.error instanceof Error
                ? deleteMutation.error.message
                : "회원 탈퇴에 실패했습니다."}
            </p>
          )}

          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              disabled={deleteMutation.isPending}
              className="rounded-full border border-white/85 px-4.5 py-2.25 text-[13px] font-semibold text-[oklch(0.4_0.025_315)] shadow-neu-pill-secondary hover:text-[oklch(0.24_0.025_315)] active:shadow-neu-pill-active disabled:cursor-default disabled:opacity-60"
            >
              취소
            </button>
            <button
              type="button"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="rounded-full bg-[oklch(0.5_0.17_22)] px-5 py-2.25 text-[13px] font-bold text-white shadow-neu-cta-pill enabled:hover:bg-[oklch(0.44_0.17_22)] disabled:cursor-default disabled:opacity-60"
            >
              탈퇴
            </button>
          </div>
        </>
      ) : (
        <>
          <div>
            <p className="text-base font-extrabold tracking-[-0.02em]">설정</p>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-[12.5px] font-semibold text-neu-muted">
              화면 테마
            </p>
            <div
              className="flex gap-1 rounded-[13px] border border-white/70 p-1"
              style={sunkenPanelStyle}
            >
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-[9px] px-2.5 py-2 text-[12.5px] font-bold transition-shadow duration-150 hover:text-[oklch(0.24_0.025_315)] active:shadow-neu-tab-active ${
                  theme === "light"
                    ? "text-neu-hi shadow-neu-tab-raised"
                    : "text-neu-muted"
                }`}
                style={segmentTabStyle(theme === "light")}
              >
                <SunIcon className="flex-none" />
                라이트
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-[9px] px-2.5 py-2 text-[12.5px] font-bold transition-shadow duration-150 hover:text-[oklch(0.24_0.025_315)] active:shadow-neu-tab-active ${
                  theme === "dark"
                    ? "text-neu-hi shadow-neu-tab-raised"
                    : "text-neu-muted"
                }`}
                style={segmentTabStyle(theme === "dark")}
              >
                <MoonIcon className="flex-none" />
                다크
              </button>
            </div>
          </div>

          <div className="h-px bg-[rgba(142,128,166,0.28)]" />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-semibold text-neu-ink">
                회원탈퇴
              </p>
              <p className="text-[11.5px] text-neu-muted">
                계정과 모든 데이터를 삭제합니다.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="flex-none rounded-full border border-white/85 px-4 py-2 text-[12.5px] font-semibold text-[oklch(0.5_0.17_22)] shadow-neu-pill-secondary hover:text-[oklch(0.44_0.17_22)] active:shadow-neu-pill-active"
            >
              회원탈퇴
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
