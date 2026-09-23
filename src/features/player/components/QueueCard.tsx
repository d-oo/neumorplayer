import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePlayerStore } from "../lib/usePlayerStore";
import { formatDuration } from "@/shared/lib/format-time";
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
import TrackThumbnail from "@/shared/components/TrackThumbnail";
import ThumbBox from "@/shared/components/ThumbBox";
import IconCircleButton from "@/shared/components/IconCircleButton";
import MutedNote from "@/shared/components/MutedNote";

// 시안(docs/design/)의 "다음 트랙/재생목록" 카드. "재생목록" 탭은 지금 재생 중인
// 재생목록의 트랙 목록이 아니라 — 원본 코드(PLAYLISTS.map)를 보면 — 내 재생목록
// 목록(이동 링크)입니다. 헷갈렸던 부분이라 남겨둡니다.
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

  const upcoming = queue.slice(currentIndex + 1);

  const { data: playlists = [] } = useQuery({
    queryKey: playlistsQueryKey(user?.id),
    queryFn: fetchPlaylists,
    enabled: !!user && queueView === "playlist",
  });

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
    <section className="flex min-h-0 flex-col overflow-hidden rounded-3xl border border-white/80 bg-neu-surface shadow-neu-raised">
      <div
        className="mx-3.5 mt-3.5 mb-2.5 flex gap-1 rounded-[13px] border border-white/70 p-1"
        style={sunkenPanelStyle}
      >
        <button
          type="button"
          onClick={() => setQueueView("next")}
          className={`flex-1 whitespace-nowrap px-2.5 py-2 text-[12.5px] ${segmentTabClass(
            queueView === "next",
          )}`}
          style={segmentTabStyle(queueView === "next")}
        >
          재생 트랙
        </button>
        <button
          type="button"
          onClick={() => setQueueView("playlist")}
          className={`flex-1 whitespace-nowrap px-2.5 py-2 text-[12.5px] ${segmentTabClass(
            queueView === "playlist",
          )}`}
          style={segmentTabStyle(queueView === "playlist")}
        >
          재생목록
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3.5">
        {queueView === "next" ? (
          upcoming.length > 0 ? (
            <div className="flex flex-col gap-0.75">
              {upcoming.map((track, i) => (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => jumpTo(currentIndex + 1 + i)}
                  className={`flex items-center gap-2.75 rounded-[10px] px-2 py-1.75 text-left ${rowHoverClass}`}
                >
                  <ThumbBox size="queue">
                    <TrackThumbnail
                      videoId={track.video_id}
                      className="h-full w-full"
                    />
                  </ThumbBox>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold leading-4.5 text-neu-ink">
                      {track.title}
                    </p>
                    <p className="mt-0.5 truncate text-[11.5px] leading-3.75 text-neu-muted">
                      {track.artist.join(", ")}
                    </p>
                  </div>
                  <span className="font-neu-mono text-[11.5px] text-neu-muted">
                    {formatDuration(track.duration)}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <MutedNote className="px-2 py-1.75">다음 곡이 없습니다.</MutedNote>
          )
        ) : (
          <div className="flex flex-col">
            <div className="mb-1.5 flex items-center gap-1.5">
              <div
                className="flex min-w-0 flex-1 items-center rounded-[10px] border border-white/80 px-2.5 py-1.5"
                style={sunkenPanelStyle}
              >
                <input
                  value={newPlaylistTitle}
                  onChange={(e) => setNewPlaylistTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreatePlaylist();
                  }}
                  placeholder="새 재생목록 이름"
                  className="min-w-0 flex-1 bg-transparent text-[12.5px] font-medium text-[oklch(0.25_0.025_315)] outline-none placeholder:text-[oklch(0.63_0.018_315)]"
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
                      onClick={() => navigate(`/playlist/${pl.id}`)}
                      className={`flex items-center gap-2.75 rounded-[10px] px-2 py-1.75 text-left ${rowHoverClass}`}
                      style={currentTrackRowStyle(isActive)}
                    >
                      <ThumbBox size="queue">
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
