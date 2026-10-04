import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { usePlayerStore } from "@/features/player/lib/usePlayerStore";
import { createPlaylist, playlistsQueryKey } from "../lib/playlists";
import { usePlaylists } from "../hooks/usePlaylists";
import { sunkenPanelStyle } from "@/shared/styles/sunken-panel-style";
import { currentTrackRowStyle } from "@/shared/styles/current-track-row-style";
import { isUniqueViolation } from "@/shared/lib/is-unique-violation";
import { PlusIcon } from "@/shared/components/icons";
import PlaylistCoverGrid from "./PlaylistCoverGrid";
import MarqueeText from "@/shared/components/MarqueeText";
import ThumbBox from "@/shared/components/ThumbBox";
import IconCircleButton from "@/shared/components/IconCircleButton";
import MutedNote from "@/shared/components/MutedNote";

// 사이드바 QueueCard(dashboard)의 "재생목록" 탭 내용. 지금 재생 중인 재생목록의 트랙
// 목록이 아니라 — 원본 코드(PLAYLISTS.map)를 보면 — 내 재생목록 목록(이동 링크)과 새
// 재생목록 만들기 입력창입니다. 헷갈렸던 부분이라 남겨둡니다. 지금 재생 중인
// 재생목록 행의 data-active="true"는 QueueCard가 탭을 열 때 그 행으로 스크롤하는
// 표시입니다.
//
// "재생 트랙" 탭에 있는 동안에도 언마운트하지 않고 hidden으로 숨겨만 둡니다 — 입력하다
// 만 새 재생목록 이름과 오류 문구가 탭을 오가도 남아 있어야 해서입니다(QueueCard 안에
// 있던 시절과 같은 동작). 숨겨져 있는 동안엔 목록을 불러오지 않습니다.
export default function PlaylistNavList({ hidden }: { hidden: boolean }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newPlaylistTitle, setNewPlaylistTitle] = useState("");
  const playingPlaylistId = usePlayerStore((s) => s.playingPlaylistId);

  const { data: playlists = [] } = usePlaylists(!hidden);

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
    ? isUniqueViolation(createPlaylistMutation.error)
      ? "이미 같은 이름의 재생목록이 있습니다."
      : "재생목록을 만들지 못했습니다."
    : null;

  function handleCreatePlaylist() {
    if (!newPlaylistTitle.trim() || createPlaylistMutation.isPending) return;
    createPlaylistMutation.mutate();
  }

  return (
    <div className="flex flex-col" hidden={hidden}>
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
          disabled={!newPlaylistTitle.trim() || createPlaylistMutation.isPending}
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
                className="flex items-center gap-2.75 rounded-[10px] px-2 py-1.75 text-left hover:bg-neu-row-hover"
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
  );
}
