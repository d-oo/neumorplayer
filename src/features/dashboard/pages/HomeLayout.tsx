import { useState, type ReactNode } from "react";
import { NavLink, Outlet, useSearchParams } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import PlayerPanel from "@/features/player/components/PlayerPanel";
import QueueCard from "@/features/player/components/QueueCard";
import YouTubePlayer from "@/features/player/components/YouTubePlayer";
import { VideoSlotProvider } from "@/features/player/VideoSlotProvider";
import { SearchGlyphIcon } from "@/shared/components/icons";
import SearchResultsView from "@/features/library/components/SearchResultsView";
import { segmentTabStyle } from "@/shared/styles/segment-tab-style";
import { sunkenPanelStyle } from "@/shared/styles/sunken-panel-style";

// docs/design/ 시안(헤더)의 라이브러리/탐색 세그먼트 탭 — 활성/비활성 색상·그림자는
// segmentTabStyle 공유(LibraryPage 정렬 탭, QueueCard 토글과 동일한 값).
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
      className="whitespace-nowrap rounded-[9px] px-3.5 py-1.75 text-[13px] font-bold hover:text-[oklch(0.24_0.025_315)]"
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
// 헤더의 "라이브러리 내 검색" 입력은 시안대로 여기(헤더)에 있습니다. ?q=가 있으면
// 시안의 isSearch 상태처럼 지금 보고 있던 라우트(Outlet) 대신 SearchResultsView를
// 보여주고, 지우면 원래 라우트로 돌아갑니다.
export default function HomeLayout() {
  const { user, signOut } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";

  // 입력창 값은 로컬 상태로만 들고 있다가, 엔터를 누르거나 검색 아이콘을 클릭했을 때만
  // ?q=를 커밋합니다(타이핑 즉시 검색 결과 화면으로 넘어가지 않도록). 뒤로가기 등으로
  // query가 바뀌면(예: 다른 탭으로 이동) 입력창도 따라갑니다 — useEffect 대신 React
  // 공식 문서가 권장하는 "prop 변경 시 상태 조정" 패턴(렌더 중 직접 비교 후 setState)을
  // 씁니다. useEffect로 하면 커밋된 값을 화면에 그리고 나서 한 프레임 뒤에 다시 리렌더가
  // 발생합니다.
  const [inputValue, setInputValue] = useState(query);
  const [syncedQuery, setSyncedQuery] = useState(query);
  if (query !== syncedQuery) {
    setSyncedQuery(query);
    setInputValue(query);
  }

  function commitQuery(value: string) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set("q", value);
        else next.delete("q");
        return next;
      },
      { replace: true },
    );
  }

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
          <div className="flex h-full w-full flex-col overflow-hidden rounded-3xl border border-white/80 bg-neu-surface shadow-neu-raised">
            <header
              className="flex items-center gap-3.5 px-5.5 py-3.5"
              style={{ borderBottom: "1px solid rgba(142,128,166,0.28)" }}
            >
              <div className="flex flex-none items-center gap-2.25">
                <img
                  src="/favicon.png"
                  alt=""
                  className="h-5.5 w-5.5 rounded-full object-cover"
                  style={{
                    boxShadow:
                      "5px 5px 11px rgba(142,128,166,0.55), -4px -4px 9px rgba(255,255,255,0.95)",
                  }}
                />
                <span className="text-base font-extrabold tracking-[-0.04em] text-neu-ink">
                  YTMPlayer
                </span>
              </div>

              <nav
                className="ml-1.5 flex flex-none gap-0.75 rounded-xl border border-white/70 p-1"
                style={sunkenPanelStyle}
              >
                <HeaderNavTab to="/" end>
                  라이브러리
                </HeaderNavTab>
                <HeaderNavTab to="/explore">탐색</HeaderNavTab>
              </nav>

              <div
                className="flex min-w-0 flex-1 items-center gap-2.5 rounded-[11px] border border-white/80 px-3.5 py-2.25"
                style={{
                  background: "oklch(0.915 0.014 315)",
                  boxShadow:
                    "inset 4px 4px 8px rgba(142,128,166,0.36), inset -3px -3px 7px rgba(255,255,255,0.85)",
                }}
              >
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      commitQuery(inputValue);
                    }
                  }}
                  placeholder="라이브러리 내 검색(제목, 아티스트, 태그 검색)"
                  className="min-w-0 flex-1 bg-transparent text-[13.5px] font-medium text-[oklch(0.25_0.025_315)] outline-none placeholder:text-[oklch(0.63_0.018_315)]"
                />
                <button
                  type="button"
                  onClick={() => commitQuery(inputValue)}
                  aria-label="검색"
                  className="grid h-4.5 w-4.5 flex-none cursor-pointer place-items-center text-[oklch(0.55_0.02_315)] hover:text-[oklch(0.2_0.025_315)]"
                >
                  <SearchGlyphIcon />
                </button>
              </div>

              <div
                className="flex flex-none items-center gap-2 rounded-full border border-white/80 py-1.25 pl-1.5 pr-3.25"
                style={{
                  background: "oklch(0.915 0.014 315)",
                  boxShadow:
                    "inset 4px 4px 8px rgba(142,128,166,0.36), inset -3px -3px 7px rgba(255,255,255,0.85)",
                }}
              >
                <div
                  className="h-6 w-6 rounded-full border border-white/85"
                  style={{
                    background: "color-mix(in oklab, #b344ff 14%, transparent)",
                    boxShadow:
                      "inset 3px 3px 6px rgba(150,136,175,0.45), inset -2px -2px 5px rgba(255,255,255,0.9)",
                  }}
                />
                <span className="text-[12.5px] font-semibold text-neu-ink">
                  {user?.email}
                </span>
              </div>

              {/* 시안에는 없는, 이 앱에 실제로 필요해서 추가한 로그아웃 버튼입니다. */}
              <button
                type="button"
                onClick={() => void signOut()}
                className="flex-none text-xs text-neu-muted hover:text-neu-ink"
              >
                로그아웃
              </button>
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
