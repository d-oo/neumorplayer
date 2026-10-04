import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { deleteAccount } from "../api/account";
import { themeQueryKey, updateThemeSetting } from "../api/settings";
import Modal from "@/shared/components/Modal";
import ModalHeader from "@/shared/components/ModalHeader";
import { ConfirmDialogContent } from "@/shared/components/ConfirmModal";
import { MoonIcon, SunIcon } from "@/shared/components/icons";
import { sunkenPanelStyle } from "@/shared/styles/sunken-panel-style";
import { secondaryPillButtonClass } from "@/shared/styles/secondary-button-class";
import {
  segmentTabClass,
  segmentTabStyle,
} from "@/shared/styles/segment-tab-style";
import { useThemeStore, type Theme } from "@/shared/lib/theme";

// ProfileDropdown의 "설정" 메뉴가 여는 모달(docs/todos.md 항목 처리). 테마 선택은
// user_settings.theme(Supabase, features/auth/api/settings.ts)에 저장되고, 화면에는
// useThemeStore를 통해 즉시(낙관적으로) 반영됩니다 — 이 모달은 HomeLayout(인증 영역)
// 안에서만 열리므로 user가 항상 있습니다. 회원탈퇴는 docs/todos.md의 "회원 탈퇴(계정+
// 데이터 삭제)" 항목대로 확인 단계를 거쳐 /api/account-delete를 호출한다.
export default function SettingsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { user, signOut } = useAuth();
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const queryClient = useQueryClient();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: async () => {
      await signOut();
      handleClose();
    },
  });

  const themeMutation = useMutation({
    mutationFn: (next: Theme) => updateThemeSetting(user!.id, next),
    onSuccess: (_data, next) => {
      setTheme(next);
      queryClient.setQueryData(themeQueryKey(user?.id), next);
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
        <ConfirmDialogContent
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={() => deleteMutation.mutate()}
          isPending={deleteMutation.isPending}
          errorMessage={
            deleteMutation.isError
              ? deleteMutation.error instanceof Error
                ? deleteMutation.error.message
                : "회원 탈퇴에 실패했습니다."
              : null
          }
          title="정말 탈퇴하시겠어요?"
          description="계정과 저장된 트랙·재생목록이 모두 삭제되며 되돌릴 수 없습니다."
          confirmLabel="탈퇴"
        />
      ) : (
        <>
          <ModalHeader title="설정" />

          <div className="flex flex-col gap-2">
            <p className="text-[12.5px] font-semibold text-neu-muted">
              화면 테마
            </p>
            <div
              className="flex gap-1 rounded-[13px] border border-(--neu-border-70) p-1"
              style={sunkenPanelStyle}
            >
              <button
                type="button"
                onClick={() => themeMutation.mutate("light")}
                disabled={themeMutation.isPending}
                className={`flex flex-1 items-center justify-center gap-1.5 px-2.5 py-2 text-[12.5px] disabled:cursor-default ${segmentTabClass(
                  theme === "light",
                )}`}
                style={segmentTabStyle(theme === "light")}
              >
                <SunIcon className="flex-none" />
                라이트
              </button>
              <button
                type="button"
                onClick={() => themeMutation.mutate("dark")}
                disabled={themeMutation.isPending}
                className={`flex flex-1 items-center justify-center gap-1.5 px-2.5 py-2 text-[12.5px] disabled:cursor-default ${segmentTabClass(
                  theme === "dark",
                )}`}
                style={segmentTabStyle(theme === "dark")}
              >
                <MoonIcon className="flex-none" />
                다크
              </button>
            </div>
          </div>

          <div className="h-px bg-neu-divider" />

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
              className={`flex-none px-4 py-2 text-[12.5px] text-(--neu-danger) hover:text-(--neu-danger-hover) ${secondaryPillButtonClass}`}
            >
              회원탈퇴
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
