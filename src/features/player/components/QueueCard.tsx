import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePlayerStore } from "../lib/usePlayerStore";
import {
  segmentTabClass,
  segmentTabStyle,
} from "@/shared/styles/segment-tab-style";
import { sunkenPanelStyle } from "@/shared/styles/sunken-panel-style";
import { currentTrackRowStyle } from "@/shared/styles/current-track-row-style";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  createPlaylist,
  fetchPlaylists,
  playlistsQueryKey,
} from "@/features/playlist/lib/playlists";
import { PlusIcon } from "@/shared/components/icons";
import PlaylistCoverGrid from "./PlaylistCoverGrid";
import MarqueeText from "./MarqueeText";
import DurationPlayButton from "./DurationPlayButton";
import TrackThumbnail from "@/shared/components/TrackThumbnail";
import ThumbBox from "@/shared/components/ThumbBox";
import IconCircleButton from "@/shared/components/IconCircleButton";
import MutedNote from "@/shared/components/MutedNote";

// 시안(docs/design/)의 "재생 트랙/재생목록" 카드. "재생 트랙" 탭은 지금 큐 전체
// (단일 곡 재생이면 그 곡 하나, 재생목록 재생이면 이미 들은 곡까지 포함한 재생목록
// 전체)를 보여주고 현재 곡을 강조합니다. "재생목록" 탭은 지금 재생 중인 재생목록의
// 트랙 목록이 아니라 — 원본 코드(PLAYLISTS.map)를 보면 — 내 재생목록 목록(이동
// 링크)입니다. 헷갈렸던 부분이라 남겨둡니다.
//
// 탭 버튼을 누를 때마다(이미 선택된 탭을 다시 눌러도) 지금 재생 중인 곡/재생목록
// 행(data-active="true")이 보이도록 목록을 스크롤합니다.
const rowHoverClass = "hover:bg-neu-row-hover";

export default function QueueCard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [queueView, setQueueView] = useState<"next" | "playlist">("next");
  const [newPlaylistTitle, setNewPlaylistTitle] = useState("");

  const queue = usePlayerStore((s) => s.queue);
  const currentIndex = usePlayerStore((s) => s.currentIndex);
  const playingPlaylistId = usePlayerStore((s) => s.playingPlaylistId);
  const jumpTo = usePlayerStore((s) => s.jumpTo);

  const listRef = useRef<HTMLDivElement>(null);
  const pendingScrollRef = useRef(false);
  const [scrollRequest, setScrollRequest] = useState(0);

  const { data: playlists = [], isFetched: arePlaylistsFetched } = useQuery({
    queryKey: playlistsQueryKey(user?.id),
    queryFn: fetchPlaylists,
    enabled: !!user && queueView === "playlist",
  });

  function selectTab(view: "next" | "playlist") {
    setQueueView(view);
    pendingScrollRef.current = true;
    setScrollRequest((n) => n + 1);
  }

  // "재생목록" 탭은 탭을 연 뒤에야 목록을 불러오므로(enabled 조건), 처음 여는
  // 경우엔 목록이 도착해 다시 렌더링된 뒤에 스크롤합니다 — 그때까지는
  // pendingScrollRef로 요청을 들고 있습니다.
  useEffect(() => {
    if (!pendingScrollRef.current) return;
    if (queueView === "playlist" && !arePlaylistsFetched) return;
    pendingScrollRef.current = false;
    const container = listRef.current;
    const target = container?.querySelector<HTMLElement>(
      '[data-active="true"]',
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

  const createPlaylistMutation = useMutation({
    mutationFn: () => createPlaylist(user!.id, newPlaylistTitle.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playlistsQueryKey(user?.id) });
      setNewPlaylistTitle("");
    },
  });

  // playlists(user_id, title) unique 제약 위반(코드 23505)만 사용자에게 이해할 수
  // 있는 문구로 바꾸고, 나머지는 일반 실패 메시지로 보여줍니다.
  const createErrorMessage = createPlaylistMutation.isError
    ? (createPlaylistMutation.error as { code?: string } | null)?.code ===
      "23505"
      ? "이미 같은 이름의 재생목록이 있습니다."
      : "재생목록을 만들지 못했습니다."
    : null;

  function handleCreatePlaylist() {
    if (!newPlaylistTitle.trim() || createPlaylistMutation.isPending) return;
    createPlaylistMutation.mutate();
  }

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
        {queueView === "next" ? (
          queue.length > 0 ? (
            <div className="flex flex-col gap-0.75">
              {queue.map((track, i) => {
                const isCurrent = i === currentIndex;
                return (
                  // 행 클릭은 아무 동작도 하지 않습니다 — 재생은 재생시간 자리의
                  // hover 버튼으로만(DurationPlayButton 주석 참고).
                  <div
                    key={track.id}
                    data-active={isCurrent}
                    className={`group/track flex items-center gap-2.75 rounded-[10px] px-2 py-1.75 ${rowHoverClass}`}
                    style={currentTrackRowStyle(isCurrent)}
                  >
                    <ThumbBox>
                      <TrackThumbnail
                        videoId={track.video_id}
                        className="h-full w-full"
                      />
                    </ThumbBox>
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-[13px] font-semibold leading-4.5"
                        style={{
                          color: isCurrent ? "var(--neu-hi)" : "var(--neu-ink)",
                        }}
                      >
                        {track.title}
                      </p>
                      <p className="mt-0.5 truncate text-[11.5px] leading-3.75 text-neu-muted">
                        {track.artist.join(", ")}
                      </p>
                    </div>
                    <DurationPlayButton
                      duration={track.duration}
                      onPlay={() => jumpTo(i)}
                      label={`${track.title} 재생`}
                      align="end"
                      textClassName="font-neu-mono text-[11.5px] text-neu-muted"
                      isCurrent={isCurrent}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <MutedNote className="px-2 py-1.75">
              재생 중인 곡이 없습니다.
            </MutedNote>
          )
        ) : (
          <div className="flex flex-col">
            <div className="mb-1.5 flex items-center gap-1.5">
              <div
                className="flex min-w-0 flex-1 items-center rounded-[10px] border border-(--neu-border-80) px-2.5 py-1.5"
                style={sunkenPanelStyle}
              >
                <input
                  value={newPlaylistTitle}
                  onChange={(e) => setNewPlaylistTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreatePlaylist();
                  }}
                  placeholder="새 재생목록 이름"
                  className="min-w-0 flex-1 bg-transparent text-[12.5px] font-medium text-(--neu-ink-25) outline-none placeholder:text-(--neu-ink-63)"
                />
              </div>
              <IconCircleButton
                size="md"
                onClick={handleCreatePlaylist}
                disabled={
                  !newPlaylistTitle.trim() || createPlaylistMutation.isPending
                }
                aria-label="재생목록 추가"
                className="flex-none text-neu-hi shadow-neu-raised-sm"
              >
                <PlusIcon />
              </IconCircleButton>
            </div>
            {createErrorMessage && (
              <p className="mb-1.5 px-1 text-[11px] font-semibold text-red-500">
                {createErrorMessage}
              </p>
            )}

            {playlists.length > 0 ? (
              <div className="flex flex-col gap-0.75">
                {playlists.map((pl) => {
                  const isActive = pl.id === playingPlaylistId;
                  return (
                    <button
                      key={pl.id}
                      type="button"
                      data-active={isActive}
                      onClick={() => navigate(`/playlist/${pl.id}`)}
                      className={`flex items-center gap-2.75 rounded-[10px] px-2 py-1.75 text-left ${rowHoverClass}`}
                      style={currentTrackRowStyle(isActive)}
                    >
                      <ThumbBox>
                        <PlaylistCoverGrid
                          videoIds={pl.coverVideoIds}
                          className="h-full w-full"
                        />
                      </ThumbBox>
                      <div className="min-w-0">
                        <MarqueeText
                          text={pl.title}
                          className="text-[13px] font-semibold leading-4.5 text-neu-ink"
                        />
                        <p className="mt-0.5 truncate text-[11.5px] leading-3.75 text-neu-muted">
                          {pl.trackCount}곡
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <MutedNote className="px-2 py-1.75">
                아직 만든 재생목록이 없습니다.
              </MutedNote>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
