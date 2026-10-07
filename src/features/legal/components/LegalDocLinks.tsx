import { useState } from "react";
import LegalDocumentModal, { type LegalDoc } from "./LegalDocumentModal";

// 푸터(랜딩 LandingFooter, 대시보드 DashboardFooter)에 나란히 두는 "개인정보처리방침"·
// "이용약관" 글자 버튼 두 개 + 이 버튼들이 여는 모달. 글자 모양은 푸터마다 달라서
// buttonClassName으로 받습니다. 두 문서를 언제든 열 수 있게 하려는 자리입니다(YouTube API
// Developer Policies III.A, "at all times").
export default function LegalDocLinks({
  buttonClassName,
}: {
  buttonClassName: string;
}) {
  const [legalDoc, setLegalDoc] = useState<LegalDoc | null>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => setLegalDoc("privacy")}
        className={buttonClassName}
      >
        개인정보처리방침
      </button>
      <button
        type="button"
        onClick={() => setLegalDoc("terms")}
        className={buttonClassName}
      >
        이용약관
      </button>

      <LegalDocumentModal doc={legalDoc} onClose={() => setLegalDoc(null)} />
    </>
  );
}
