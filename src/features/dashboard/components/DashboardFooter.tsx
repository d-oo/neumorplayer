import LegalDocLinks from "@/features/legal/components/LegalDocLinks";

// 대시보드 본문 카드(HomeLayout) 맨 아래 줄. 랜딩 푸터(LandingFooter)와 같은 구성·글자
// 모양(왼쪽 저작권 + 개인정보처리방침·이용약관, 오른쪽 "POWERED BY YOUTUBE")입니다.
// 예전엔 YouTube 표기가 헤더의 워드마크 옆에, 두 문서 링크가 프로필 메뉴 안에 있었는데
// 이 줄로 옮겼습니다 — 둘 다 모든 대시보드 화면에서 항상 보여야 합니다(YouTube API
// Developer Policies III.F.2.a 출처 표기, III.A 개인정보처리방침 상시 접근).
//
// 높이는 py-3 + leading-4 = 40px로 고정입니다. 화면 아래쪽에 떠 있는 미니 플레이어
// (YouTubePlayer)가 이 줄을 가리지 않도록 이 높이를 계산에 넣어 두었으니, 높이를
// 바꾸면 YouTubePlayer의 FOOTER_CLEARANCE도 같이 고치세요.
export default function DashboardFooter() {
  return (
    <footer className="flex flex-none items-center justify-between gap-6 px-5.5 py-3 font-neu-mono text-[11px] leading-4 tracking-widest text-(--neu-ink-52)">
      <div className="flex items-center gap-5">
        <div>© 2026 NEUMORPLAYER</div>
        <LegalDocLinks buttonClassName="tracking-normal hover:text-(--neu-ink-34)" />
      </div>
      <div>POWERED BY YOUTUBE</div>
    </footer>
  );
}
