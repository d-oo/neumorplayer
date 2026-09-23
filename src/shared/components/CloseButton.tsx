import { XIcon } from "./icons";

// 모달/배너 우측 상단의 X 닫기 버튼(PrivacyPolicyModal, PrivacyBanner).
export default function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="닫기"
      className="grid size-7 flex-none place-items-center rounded-full text-[oklch(0.5_0.02_315)] hover:text-[oklch(0.2_0.025_315)]"
    >
      <XIcon />
    </button>
  );
}
