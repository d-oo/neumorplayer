import { useEffect, useRef } from "react";
import { useQueueCardStore } from "../lib/useQueueCardStore";
import {
  segmentTabClass,
  segmentTabStyle,
} from "@/shared/styles/segment-tab-style";
import { sunkenPanelStyle } from "@/shared/styles/sunken-panel-style";
import { usePlaylists } from "@/features/playlist/hooks/usePlaylists";
import QueueTrackList from "@/features/player/components/QueueTrackList";
import PlaylistNavList from "@/features/playlist/components/PlaylistNavList";

// 시안(docs/design/)의 "재생 트랙/재생목록" 카드. 대시보드 사이드바에만 있는 부품이라
// dashboard에 두고, 카드는 탭 전환과 스크롤만 맡습니다 — 각 탭의 내용은 그 도메인의
// 컴포넌트입니다("재생 트랙" = player의 QueueTrackList, "재생목록" = playlist의
// PlaylistNavList).
//
// 탭 버튼을 누를 때마다(이미 선택된 탭을 다시 눌러도) 지금 재생 중인 곡/재생목록
// 행(data-active="true")이 보이도록 목록을 스크롤합니다. 탭 상태는 다른 화면에서도
// "재생 트랙" 탭을 열 수 있게 useQueueCardStore에 있습니다(그쪽 주석 참고).
export default function QueueCard() {
  const queueView = useQueueCardStore((s) => s.view);
  const scrollRequest = useQueueCardStore((s) => s.scrollRequest);
  const selectTab = useQueueCardStore((s) => s.selectTab);
  const resetQueueCard = useQueueCardStore((s) => s.reset);

  const listRef = useRef<HTMLDivElement>(null);
  // 마지막으로 처리한 스크롤 요청. 마운트 시점의 값으로 시작해서, 처음 렌더링할 땐
  // 스크롤하지 않습니다.
  const handledScrollRequestRef = useRef(scrollRequest);

  // PlaylistNavList와 같은 쿼리 — 여기선 "목록이 도착했는지"만 봅니다(아래 스크롤).
  const { isFetched: arePlaylistsFetched } = usePlaylists(
    queueView === "playlist",
  );

  // 로그아웃 등으로 사라질 때 탭을 "재생 트랙"으로 되돌립니다(useQueueCardStore 참고).
  useEffect(() => resetQueueCard, [resetQueueCard]);

  // "재생목록" 탭은 탭을 연 뒤에야 목록을 불러오므로(enabled 조건), 처음 여는
  // 경우엔 목록이 도착해 다시 렌더링된 뒤에 스크롤합니다 — 그때까지는
  // handledScrollRequestRef를 갱신하지 않고 요청을 들고 있습니다.
  //
  // PlaylistNavList는 "재생 트랙" 탭에서도 hidden으로 남아 있어서, 숨겨진 쪽의 행을
  // 집지 않도록 hidden이 아닌 탭 내용 안에서만 찾습니다.
  useEffect(() => {
    if (handledScrollRequestRef.current === scrollRequest) return;
    if (queueView === "playlist" && !arePlaylistsFetched) return;
    handledScrollRequestRef.current = scrollRequest;
    const container = listRef.current;
    const target = container?.querySelector<HTMLElement>(
      ':scope > :not([hidden]) [data-active="true"]',
    );
    if (!container || !target) return;
    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    container.scrollTo({
      top:
        container.scrollTop +
        targetRect.top -
        containerRect.top -
        (containerRect.height - targetRect.height) / 2,
      behavior: "smooth",
    });
  }, [scrollRequest, queueView, arePlaylistsFetched]);

  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-3xl border border-(--neu-border-80) bg-neu-surface shadow-neu-raised">
      <div
        className="mx-3.5 mt-3.5 mb-2.5 flex gap-1 rounded-[13px] border border-(--neu-border-70) p-1"
        style={sunkenPanelStyle}
      >
        <button
          type="button"
          onClick={() => selectTab("next")}
          className={`flex-1 whitespace-nowrap px-2.5 py-2 text-[12.5px] ${segmentTabClass(
            queueView === "next",
          )}`}
          style={segmentTabStyle(queueView === "next")}
        >
          재생 트랙
        </button>
        <button
          type="button"
          onClick={() => selectTab("playlist")}
          className={`flex-1 whitespace-nowrap px-2.5 py-2 text-[12.5px] ${segmentTabClass(
            queueView === "playlist",
          )}`}
          style={segmentTabStyle(queueView === "playlist")}
        >
          재생목록
        </button>
      </div>

      <div
        ref={listRef}
        className="min-h-0 flex-1 overflow-y-auto px-3 pb-3.5"
      >
        {queueView === "next" && <QueueTrackList />}
        <PlaylistNavList hidden={queueView !== "playlist"} />
      </div>
    </section>
  );
}
