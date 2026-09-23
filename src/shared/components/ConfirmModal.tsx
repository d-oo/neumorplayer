import Modal from "./Modal";
import { secondaryPillButtonClass } from "@/shared/styles/secondary-button-class";

// 위험한 동작(삭제 등) 전에 한 번 더 확인받는 모달 — SettingsModal의 회원탈퇴
// 확인 화면에서 쓰던 마크업을 공용으로 뽑았습니다. SettingsModal은 이미 열려있는
// 모달 안에서 내용만 바꿔치기하는 구조라 그대로 두고, 그 외에(MusicInfoPage의 트랙
// 삭제처럼) 페이지에서 곧바로 확인 모달을 띄워야 하는 곳에서 씁니다.
export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  isPending,
  errorMessage,
  title,
  description,
  confirmLabel,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
  errorMessage?: string | null;
  title: string;
  description: string;
  confirmLabel: string;
}) {
  return (
    <Modal open={open} onClose={onClose} className="w-93 px-5.5 pt-5.5 pb-5">
      <div>
        <p className="text-base font-extrabold tracking-[-0.02em]">{title}</p>
        <p className="mt-1.25 text-[12.5px] text-neu-muted">{description}</p>
      </div>

      {errorMessage && <p className="text-xs text-red-500">{errorMessage}</p>}

      <div className="flex items-center justify-end gap-2.5">
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className={`px-4.5 py-2.25 text-[13px] text-(--neu-ink-40) hover:text-(--neu-ink-24) disabled:cursor-default disabled:opacity-60 ${secondaryPillButtonClass}`}
        >
          취소
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isPending}
          className="rounded-full bg-(--neu-danger) px-5 py-2.25 text-[13px] font-bold text-white shadow-neu-cta-pill enabled:hover:bg-(--neu-danger-hover) disabled:cursor-default disabled:opacity-60"
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
