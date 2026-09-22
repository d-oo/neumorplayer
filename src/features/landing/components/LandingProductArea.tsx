import LandingCdPlayer from "./LandingCdPlayer";
import LandingVideoArea from "./LandingVideoArea";
import LandingSearchCard from "./LandingSearchCard";
import type { useGuestPlayer } from "../lib/useGuestPlayer";
import type { useLandingSearch } from "../lib/useLandingSearch";

// 886px 제품 영역: 상단 행(CD 플레이어 340×297 + 동영상 528×297) + 탐색 카드.
// 게스트 재생/검색 상태는 LandingPage가 만들어 여기로 내려줍니다.
export default function LandingProductArea({
  guestPlayer,
  search,
}: {
  guestPlayer: ReturnType<typeof useGuestPlayer>;
  search: ReturnType<typeof useLandingSearch>;
}) {
  return (
    <div className="flex w-221.5 max-w-full flex-col items-center gap-4.5 self-center">
      <div className="flex w-full items-stretch justify-center gap-4.5">
        <LandingCdPlayer guestPlayer={guestPlayer} />
        <LandingVideoArea guestPlayer={guestPlayer} />
      </div>
      <LandingSearchCard search={search} guestPlayer={guestPlayer} />
    </div>
  );
}
