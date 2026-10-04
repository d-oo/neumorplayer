// 헤더 브랜드 워드마크 — 랜딩 헤더와 로그인 후 대시보드 헤더가 함께 씁니다.
// Space Grotesk 700(index.html에서 로드) + 뉴모피즘 각인(textShadow)이 한 묶음이라
// 글자만 따로 쓰지 말고 이 컴포넌트를 그대로 쓰세요. 대시보드 헤더는 한 줄, 랜딩
// 헤더는 stacked(두 줄)로 씁니다.
//
// AuthLayout(로그인/회원가입)에는 같은 워드마크의 27px 변형이 따로 있는데, 글자
// 크기뿐 아니라 각인 그림자 알파(0.55)까지 시안이 다르게 지정해서 합치지
// 않았습니다 — 억지로 합치면 둘 중 한쪽 모양이 바뀝니다. 두 줄 글자 배치만
// 아래 BrandWordmarkStackedLines로 공유합니다.
export default function BrandWordmark({ stacked = false }: { stacked?: boolean }) {
  return (
    <div
      className={`font-['Space_Grotesk'] text-base font-bold text-neu-hi ${
        stacked ? "leading-[1.1] whitespace-nowrap" : "tracking-[-0.01em]"
      }`}
      style={{ textShadow: "var(--neu-shadow-wordmark)" }}
    >
      {stacked ? <BrandWordmarkStackedLines /> : "NEUMORPLAYER"}
    </div>
  );
}

// "NEUMOR" / "PLAYER" 두 줄 배치. 두 줄의 글자 폭이 같아지도록 줄마다 자간을 따로
// 줬습니다 — 원래 자간(-0.015em) 기준으로 NEUMOR는 좁히고 PLAYER는 넓혀 차이를
// 반씩 나눴습니다. em 단위라 글자 크기와 상관없이 폭이 맞지만, 폰트를 바꾸면 다시
// 재서 맞춰야 합니다. 글자 크기·줄 높이·그림자는 감싸는 쪽이 정합니다.
export function BrandWordmarkStackedLines() {
  return (
    <>
      <span className="block tracking-[-0.06em]">NEUMOR</span>
      <span className="block tracking-[0.0536em]">PLAYER</span>
    </>
  );
}
