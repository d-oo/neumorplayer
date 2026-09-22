import type { ReactNode } from "react";

// 화면 중앙 모달의 공통 껍데기(오버레이 + neu-surface 카드) — AddToPlaylistButton.tsx의
// "재생목록에 추가" 모달에서 처음 쓰인 마크업을 뽑아낸 것입니다. 내용(제목/본문/버튼
// 영역)은 도메인마다 다르므로 children으로 받고, 카드 자체의 너비·패딩처럼 호출부마다
// 달라지는 값만 className으로 받습니다.
export default function Modal({
  open,
  onClose,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[rgba(40,22,58,0.32)] p-5"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`flex flex-col gap-4 rounded-[20px] border border-white/85 bg-neu-surface ${className ?? ""}`}
        style={{
          boxShadow:
            "18px 18px 40px rgba(60,40,84,0.45), -8px -8px 18px rgba(255,255,255,0.7)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
