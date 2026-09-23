const FEATURES = [
  {
    title: "손으로 돌리는 디스크",
    body: "CD를 드래그해 구간을 찾습니다. 관성까지 계산해 실제 턴테이블처럼 반응합니다.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
        <circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="11" cy="11" r="2.4" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: "제목·아티스트 탐색",
    body: "검색창에 한 번 입력하면 결과가 카드로 나옵니다. 고른 카드가 곧바로 재생됩니다.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
        <path
          d="M3 5h12M3 11h12M3 17h7"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M17 13v6M14 16h6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "YouTube 전곡 연결",
    body: "재생은 YouTube에서 그대로 이어집니다. 별도 업로드 없이 검색해서 바로 담으세요.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
        <rect
          x="2.5"
          y="4.5"
          width="17"
          height="13"
          rx="3.5"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <polygon points="9,8 14.5,11 9,14" fill="currentColor" />
      </svg>
    ),
  },
];

// 886px, 3열 기능 소개 카드. 목 API 데이터가 아니라 정적 카피라 하드코딩합니다.
export default function LandingFeatureCards() {
  return (
    <div className="grid w-221.5 max-w-full grid-cols-3 gap-5.5 self-center">
      {FEATURES.map((f) => (
        <div
          key={f.title}
          className="flex flex-col gap-3.5 rounded-[26px] border border-(--neu-border-80) bg-neu-surface p-7"
          style={{ boxShadow: "var(--neu-shadow-feature-card)" }}
        >
          <div
            className="grid h-13 w-13 place-items-center rounded-2xl bg-neu-surface text-neu-hi"
            style={{ boxShadow: "var(--neu-shadow-disc-hub)" }}
          >
            {f.icon}
          </div>
          <div className="text-lg font-extrabold tracking-tight">
            {f.title}
          </div>
          <div className="text-pretty text-[13.5px] leading-[1.8] break-keep text-neu-muted">
            {f.body}
          </div>
        </div>
      ))}
    </div>
  );
}
