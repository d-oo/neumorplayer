import { type ReactNode } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useLibrarySearchQuery } from "../lib/useLibrarySearchQuery";
import { useThemeSync } from "@/features/auth/hooks/useThemeSync";
import ProfileDropdown from "@/features/auth/components/ProfileDropdown";
import BrandWordmark from "@/shared/components/BrandWordmark";
import PlayerPanel from "@/features/player/components/PlayerPanel";
import QueueCard from "@/features/player/components/QueueCard";
import YouTubePlayer from "@/features/player/components/YouTubePlayer";
import { VideoSlotProvider } from "@/features/player/VideoSlotProvider";
import { SearchGlyphIcon } from "@/shared/components/icons";
import SearchFieldInput from "@/shared/components/SearchFieldInput";
import SearchResultsView from "@/features/library/components/SearchResultsView";
import {
  segmentTabClass,
  segmentTabStyle,
} from "@/shared/styles/segment-tab-style";
import { sunkenPanelStyle } from "@/shared/styles/sunken-panel-style";
import { fieldBoxStyle } from "@/shared/styles/field-box-style";

// docs/design/ 시안(헤더)의 라이브러리/탐색 세그먼트 탭 — 배경(segmentTabStyle)과
// 공통 클래스(segmentTabClass)를 LibraryPage 정렬 탭·QueueCard 토글·SettingsModal
// 테마 선택과 공유하고, 패딩·글자 크기만 여기서 따로 얹습니다.
function HeaderNavTab({
  to,
  end,
  children,
}: {
  to: string;
  end?: boolean;
  children: ReactNode;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `whitespace-nowrap px-3.5 py-1.75 text-[13px] ${segmentTabClass(isActive)}`
      }
      style={({ isActive }) => segmentTabStyle(isActive)}
    >
      {children}
    </NavLink>
  );
}

// old-src/src/Home.js(Player + Playlists 사이드바 + 메인 컨텐츠 레이아웃)를 대체합니다.
// docs/design/의 "1b 뉴모피즘 대시보드" 시안 톤(--neu-* 토큰)을 그대로 씁니다 — 로그인
// 페이지는 아직 다크 톤이지만, 그건 나중에 이 디자인으로 옮길 예정이라 지금은 신경 쓰지
// 않습니다.
// 좌측 PlayerPanel은 어느 페이지에서든 항상 보이는 미니 플레이어이고, YouTubePlayer는
// music/:musicId 라우트에서만 화면에 보이지만 다른 라우트로 이동해도 배경 재생을 위해
// 항상 마운트된 상태를 유지합니다(라우트 페이지 안에 두면 라우트 전환 시 언마운트되어
// 재생이 끊깁니다 — 대신 VideoSlotProvider로 "어디에 보여줄지"만 전달합니다).
// 헤더의 "라이브러리 내 검색" 입력은 시안대로 여기(헤더)에 있습니다. 입력값/?q= 커밋
// 규칙은 useLibrarySearchQuery가 담당하고, 여기서는 커밋된 query가 있으면 시안의
// isSearch 상태처럼 지금 보고 있던 라우트(Outlet) 대신 SearchResultsView를 보여주고,
// 지우면 원래 라우트로 돌아갑니다.
export default function HomeLayout() {
  useThemeSync();
  const { query, inputValue, setInputValue, commitQuery } =
    useLibrarySearchQuery();

  return (
    <VideoSlotProvider>
      {/* 배경(bg-neu-bg)은 화면 전체 폭을 그대로 채우고, 그 안의 실제 내용(CD 플레이어 +
          카드)만 max-w-300(1200px)로 좁혀서 mx-auto로 가운데에 둡니다 — 배경색 div 자체를
          좁히면 그 바깥에 body의 어두운 배경이 그대로 드러나 버립니다. */}
      <div className="h-dvh bg-neu-bg p-3 text-neu-ink">
        <div className="mx-auto grid h-full max-w-300 grid-cols-[320px_minmax(0,1fr)] gap-3 font-neu">
          {/* 시안(docs/design/)처럼 CD 플레이어와 다음 트랙/재생목록 카드를 grid-rows로
              쌓습니다(각자 독립된 shadow-neu-raised 카드, 12px gap). */}
          <aside className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-3">
            <PlayerPanel />
            {/* "재생목록" 탭에 내 재생목록 목록 + 새 재생목록 만들기가 있습니다. */}
            <QueueCard />
            <YouTubePlayer />
          </aside>

          {/* 헤더와 본문을 하나의 카드로 묶습니다 — 각자 shadow-neu-raised를 따로 두면
              둘 사이 좁은 간격에서 한쪽 그림자의 어두운 번짐과 다른 쪽의 밝은 하이라이트가
              충돌해 윤곽선처럼 보이는 문제가 있었습니다. */}
          <div className="flex h-full w-full flex-col overflow-hidden rounded-3xl border border-(--neu-border-80) bg-neu-surface shadow-neu-raised">
            <header
              className="flex items-center gap-3.5 px-5.5 py-3.5"
              style={{ borderBottom: "1px solid var(--neu-divider)" }}
            >
              <div className="flex flex-none items-center gap-2.25">
                <img
                  src="/favicon.png"
                  alt=""
                  className="h-5.5 w-5.5 rounded-full object-cover"
                  style={{ boxShadow: "var(--neu-shadow-logo)" }}
                />
                <BrandWordmark />
              </div>

              <nav
                className="ml-1.5 flex flex-none gap-0.75 rounded-xl border border-(--neu-border-70) p-1"
                style={sunkenPanelStyle}
              >
                <HeaderNavTab to="/" end>
                  라이브러리
                </HeaderNavTab>
                <HeaderNavTab to="/explore">탐색</HeaderNavTab>
              </nav>

              <div
                className="flex min-w-0 flex-1 items-center gap-2.5 rounded-[11px] border border-(--neu-border-80) px-3.5 py-2.25"
                style={fieldBoxStyle}
              >
                <SearchFieldInput
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      commitQuery(inputValue);
                    }
                  }}
                  placeholder="라이브러리 내 검색(제목, 아티스트, 태그 검색)"
                  className="placeholder:text-(--neu-ink-63)"
                />
                <button
                  type="button"
                  onClick={() => commitQuery(inputValue)}
                  aria-label="검색"
                  className="grid h-4.5 w-4.5 flex-none cursor-pointer place-items-center text-(--neu-ink-55) hover:text-(--neu-ink-20)"
                >
                  <SearchGlyphIcon />
                </button>
              </div>

              <ProfileDropdown />
            </header>

            {/* 시안대로 본문은 px-6.5/py-6(24px 26px) 안에 max-w-195(780px) 중앙
                정렬 래퍼를 한 번 더 둡니다 — 모든 탭이 같은 축·같은 폭을 씁니다. */}
            <main className="flex-1 overflow-y-auto px-6.5 py-6">
              <div className="mx-auto max-w-195">
                {query.trim() ? (
                  <SearchResultsView query={query} />
                ) : (
                  <Outlet />
                )}
              </div>
            </main>
          </div>
        </div>
      </div>
    </VideoSlotProvider>
  );
}
