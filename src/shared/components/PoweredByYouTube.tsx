// "Powered by YouTube" 텍스트 pill — 랜딩 히어로가 씁니다(대시보드는 푸터의
// "POWERED BY YOUTUBE" 텍스트, features/dashboard/components/DashboardFooter.tsx).
// 예전엔 공식 "Developed with YouTube" 배지
// 이미지를 썼지만, YouTube API Branding Guidelines상 그 배지는 선택 사항이고 쓰려면
// YouTube로 가는 링크여야 해서, 앱과 YouTube의 관계를 텍스트로 설명하는 이
// 방식(가이드라인이 허용)으로 바꿨습니다. 처음 랜딩 시안엔 텍스트 왼쪽에 둥근
// 사각형+재생 삼각형 아이콘이 있었는데 YouTube 아이콘을 변형한 것으로 보일 수 있어
// 뺐습니다 — 다시 넣지 마세요. YouTube 로고처럼 보이게 꾸미는 것(전용 서체, 빨간색
// 등)도 같은 이유로 피하세요.
export default function PoweredByYouTube({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`rounded-full border border-(--neu-border-70) px-4 py-2 text-[11px] tracking-[0.16em] font-neu-mono whitespace-nowrap text-(--neu-ink-46) ${className}`}
      style={{
        background: "var(--neu-surface-sunken)",
        boxShadow: "var(--neu-shadow-field-row)",
      }}
    >
      Powered by YouTube
    </div>
  );
}
