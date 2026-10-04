import type { ReactNode } from "react";

// 모달 제목 글자. 제목 옆에 다른 요소(닫기 버튼 등)를 나란히 두는 모달
// (PrivacyPolicyModal)은 이것만 따로 씁니다.
export function ModalTitle({ children }: { children: ReactNode }) {
  return (
    <p className="text-base font-extrabold tracking-[-0.02em]">{children}</p>
  );
}

// 모달 맨 위의 제목 + (있으면) 부제 한 줄. 확인 모달(ConfirmModal), 설정(SettingsModal),
// "재생목록에 추가" 모달 두 개가 같은 모양으로 씁니다.
export default function ModalHeader({
  title,
  subtitle,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
}) {
  return (
    <div>
      <ModalTitle>{title}</ModalTitle>
      {subtitle !== undefined && (
        <p className="mt-1.25 text-[12.5px] text-neu-muted">{subtitle}</p>
      )}
    </div>
  );
}
