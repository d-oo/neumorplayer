import Modal from "./Modal";
import ModalHeader from "./ModalHeader";
import ModalCancelButton from "./ModalCancelButton";

// 확인 모달의 내용(제목/설명, 오류 문구, 취소·확인 버튼). SettingsModal은 이미 열려
// 있는 설정 모달 안에서 내용만 이걸로 바꿔치기해서(회원탈퇴 확인) 모달 껍데기 없이
// 이것만 씁니다.
export function ConfirmDialogContent({
  onCancel,
  onConfirm,
  isPending,
  errorMessage,
  title,
  description,
  confirmLabel,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  isPending: boolean;
  errorMessage?: string | null;
  title: string;
  description: string;
  confirmLabel: string;
}) {
  return (
    <>
      <ModalHeader title={title} subtitle={description} />

      {errorMessage && <p className="text-xs text-red-500">{errorMessage}</p>}

      <div className="flex items-center justify-end gap-2.5">
        <ModalCancelButton onClick={onCancel} disabled={isPending} />
        <button
          type="button"
          onClick={onConfirm}
          disabled={isPending}
          className="rounded-full bg-(--neu-danger) px-5 py-2.25 text-[13px] font-bold text-white shadow-neu-cta-pill enabled:hover:bg-(--neu-danger-hover) disabled:cursor-default disabled:opacity-60"
        >
          {confirmLabel}
        </button>
      </div>
    </>
  );
}

// 위험한 동작(삭제 등) 전에 한 번 더 확인받는 모달 — 페이지에서 곧바로 확인 모달을
// 띄워야 하는 곳(MusicInfoPage의 트랙 삭제, PlaylistInfoPage의 재생목록 삭제)에서 씁니다.
export default function ConfirmModal({
  open,
  onClose,
  ...contentProps
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
      <ConfirmDialogContent onCancel={onClose} {...contentProps} />
    </Modal>
  );
}
