import { XIcon } from "./icons";

// 모달/배너 우측 상단의 X 닫기 버튼(PrivacyPolicyModal, PrivacyBanner).
export default function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="닫기"
      className="grid size-7 flex-none place-items-center rounded-full text-(--neu-ink-50-b) hover:text-(--neu-ink-20)"
    >
      <XIcon />
    </button>
  );
}
