// 헤더 브랜드 워드마크 — 랜딩 헤더와 로그인 후 대시보드 헤더가 함께 씁니다.
// Space Grotesk 700(index.html에서 로드) + 뉴모피즘 각인(textShadow)이 한 묶음이라
// 글자만 따로 쓰지 말고 이 컴포넌트를 그대로 쓰세요.
//
// AuthLayout(로그인/회원가입)에는 같은 워드마크의 27px 변형이 따로 있는데, 글자
// 크기뿐 아니라 자간(-0.015em)과 각인 그림자 알파(0.55)까지 시안이 다르게 지정해서
// 합치지 않았습니다 — 억지로 합치면 둘 중 한쪽 모양이 바뀝니다.
export default function BrandWordmark() {
  return (
    <div
      className="font-['Space_Grotesk'] text-base font-bold tracking-[-0.01em] text-neu-hi"
      style={{
        textShadow:
          "1px 1px 1.5px rgba(120,96,150,0.5), -1px -1px 1.5px rgba(255,255,255,0.95)",
      }}
    >
      NEUMORPLAYER
    </div>
  );
}
