import LegalDocLinks from "@/features/legal/components/LegalDocLinks";

// 1236px 폭(부모가 배치). 왼쪽 저작권 + 개인정보처리방침·이용약관 링크, 오른쪽
// "POWERED BY YOUTUBE" 텍스트 — 예전엔 오른쪽에 공식 "Developed with YouTube" 배지
// 이미지가 있었지만, Branding Guidelines상 배지는 선택 사항이라(쓰려면 YouTube 링크
// 필요) 히어로와 함께 텍스트 방식으로 바꿨습니다(shared/components/PoweredByYouTube.tsx).
// 대시보드 푸터(features/dashboard/components/DashboardFooter.tsx)도 같은 구성입니다.
export default function LandingFooter() {
  return (
    <div className="flex items-center justify-between gap-6 border-t border-(--neu-border-75) pt-6.5 pr-0.5 pb-8.5 pl-0.5 font-neu-mono text-[11px] tracking-widest text-(--neu-ink-52)">
      <div className="flex items-center gap-5">
        <div>© 2026 NEUMORPLAYER</div>
        <LegalDocLinks buttonClassName="tracking-normal hover:text-(--neu-ink-34)" />
      </div>
      <div>POWERED BY YOUTUBE</div>
    </div>
  );
}
