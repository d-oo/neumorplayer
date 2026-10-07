import type { ComponentType } from "react";
import Modal from "@/shared/components/Modal";
import { ModalTitle } from "@/shared/components/ModalHeader";
import CloseButton from "@/shared/components/CloseButton";
import ModalCtaButton from "@/shared/components/ModalCtaButton";
import PrivacyPolicyContent from "./PrivacyPolicyContent";
import TermsContent from "./TermsContent";

export type LegalDoc = "privacy" | "terms";

const DOCS: Record<LegalDoc, { title: string; Content: ComponentType }> = {
  privacy: { title: "개인정보처리방침", Content: PrivacyPolicyContent },
  terms: { title: "서비스 이용약관", Content: TermsContent },
};

// 개인정보처리방침/서비스 이용약관 모달. 두 문서는 별도 페이지(URL) 없이 이 모달로만
// 보여줍니다(정식 공개 계획이 없어 Google OAuth 검증용 URL이 필요 없음). 여는 곳 —
// 랜딩 배너, 로그인 안내 문구, 회원가입 동의 체크박스, 랜딩·대시보드 푸터(LegalDocLinks)
// — 이 각자 `useState<LegalDoc | null>`을 들고 doc에 넘깁니다(null이면 닫힘).
export default function LegalDocumentModal({
  doc,
  onClose,
}: {
  doc: LegalDoc | null;
  onClose: () => void;
}) {
  if (doc === null) return null;
  const { title, Content } = DOCS[doc];

  return (
    // 글꼴·색·자간·줄높이를 여기서 고정합니다 — 푸터처럼 mono 글꼴/넓은 자간/좁은
    // 줄높이를 쓰는 요소 안에서 열려도 그 값을 물려받지 않게 하려는 것입니다.
    <Modal
      open
      onClose={onClose}
      className="w-137.5 max-w-full px-6.5 pt-6 pb-5.5 font-neu leading-normal tracking-normal text-neu-ink"
    >
      <div className="flex items-start justify-between gap-4">
        <ModalTitle>{title}</ModalTitle>
        <CloseButton onClick={onClose} />
      </div>

      {/* scrollbar-color: 브라우저 기본 스크롤바의 흰 트랙이 모달 배경 위에 떠 보여서
          트랙은 투명하게, thumb는 라이트·다크 공통 값인 --neu-ink-63으로 둡니다. */}
      <div className="flex max-h-100 flex-col gap-4 overflow-y-auto pr-1 text-[13px] leading-[1.7] text-(--neu-ink-35) [scrollbar-color:var(--neu-ink-63)_transparent]">
        <Content />
      </div>

      <div className="flex justify-end">
        <ModalCtaButton onClick={onClose}>닫기</ModalCtaButton>
      </div>
    </Modal>
  );
}
