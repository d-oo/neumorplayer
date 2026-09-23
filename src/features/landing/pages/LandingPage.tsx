import { useGuestPlayer } from "../lib/useGuestPlayer";
import { useLandingSearch } from "../lib/useLandingSearch";
import LandingHeader from "../components/LandingHeader";
import LandingHero from "../components/LandingHero";
import LandingProductArea from "../components/LandingProductArea";
import LandingFeatureCards from "../components/LandingFeatureCards";
import LandingFooter from "../components/LandingFooter";
import PrivacyBanner from "../components/PrivacyBanner";

// docs/design/랜딩 페이지.zip의 단일 스크린 랜딩 페이지. 비로그인 사용자가 "/"로 오면
// src/router/HomeAccessGate.tsx가 이 페이지를 직접 렌더링합니다(HomeLayout을 거치지
// 않음). 고정 1280px 캔버스이며 반응형은 의도적으로 없습니다(시안 스펙).
//
// 게스트 재생/검색 상태는 여기서 만들어 하위로 내려줍니다 — usePlayerStore(로그인 후
// 대시보드의 전역 재생 상태)와 완전히 분리되어 있어, 이 페이지가 언마운트되면(로그인
// 성공 등) 그냥 사라지고 실제 재생 상태를 전혀 건드리지 않습니다.
export default function LandingPage() {
  const guestPlayer = useGuestPlayer();
  const search = useLandingSearch();

  return (
    <div
      className="mx-auto flex w-7xl flex-col gap-19.5 px-5.5 pt-5.5 font-neu text-neu-ink"
      style={{ background: "var(--neu-bg)" }}
    >
      <LandingHeader />
      <LandingHero />
      <LandingProductArea guestPlayer={guestPlayer} search={search} />
      <LandingFeatureCards />
      <LandingFooter />
      <PrivacyBanner />
    </div>
  );
}
