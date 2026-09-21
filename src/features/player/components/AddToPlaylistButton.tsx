import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  addTrackToPlaylist,
  fetchPlaylistIdsForTrack,
  fetchPlaylists,
  playlistMembershipQueryKey,
  playlistTracksQueryKey,
  playlistsQueryKey,
} from "@/features/playlist/lib/playlists";
import type { Track } from "@/features/library/lib/tracks";
import { CheckIcon, QueueIcon } from "@/shared/components/icons";
import PillButton from "@/shared/components/PillButton";

// old-src/src/components/MusicInfo.js의 "playlist_add" 드롭다운(이미 들어있는
// 재생목록은 회색으로 비활성 표시, 아닌 곳은 클릭해서 추가)을 이어받습니다.
// PlayerPanel(현재 재생 곡)과 MusicInfoPage(곡 상세)가 정확히 같은 동작을 필요로 해서
// 여기 한 곳으로 뽑았고, 트리거 버튼 모양만 variant로 갈립니다("icon"=PlayerPanel의
// 원형 버튼, "pill"=MusicInfoPage의 재생/삭제 버튼과 짝 맞춘 알약 버튼).
export default function AddToPlaylistButton({
  track,
  variant,
}: {
  track: Track;
  variant: "icon" | "pill";
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const { data: playlists = [] } = useQuery({
    queryKey: playlistsQueryKey(user?.id),
    queryFn: fetchPlaylists,
    enabled: !!user,
  });

  const { data: memberPlaylistIds = [] } = useQuery({
    queryKey: playlistMembershipQueryKey(track.id),
    queryFn: () => fetchPlaylistIdsForTrack(track.id),
    enabled: !!user,
  });
  const memberSet = new Set(memberPlaylistIds);
  const isQueued = memberSet.size > 0;

  const addMutation = useMutation({
    mutationFn: (playlistId: string) =>
      addTrackToPlaylist(playlistId, track.id),
    onSuccess: (_data, playlistId) => {
      queryClient.invalidateQueries({
        queryKey: playlistMembershipQueryKey(track.id),
      });
      queryClient.invalidateQueries({
        queryKey: playlistTracksQueryKey(playlistId),
      });
      queryClient.invalidateQueries({ queryKey: playlistsQueryKey(user?.id) });
    },
  });

  return (
    <div className="relative" ref={containerRef}>
      {variant === "icon" ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          title={isQueued ? "재생목록에 추가됨" : "재생목록에 추가"}
          aria-label={isQueued ? "재생목록에 추가됨" : "재생목록에 추가"}
          aria-pressed={isQueued}
          className={`grid h-9.5 w-9.5 flex-none place-items-center rounded-full bg-neu-surface hover:text-neu-hi ${
            isQueued
              ? "text-[#7b1fb0] shadow-neu-sunken"
              : "text-[oklch(0.52_0.02_315)] shadow-neu-raised-sm"
          }`}
        >
          <QueueIcon />
        </button>
      ) : (
        <PillButton
          onClick={() => setOpen((v) => !v)}
          aria-pressed={isQueued}
          pressed={isQueued}
          icon={<QueueIcon />}
        >
          재생목록에 추가
        </PillButton>
      )}

      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 max-h-64 w-52 overflow-y-auto rounded-[14px] border border-white/80 bg-neu-surface p-1.5 shadow-neu-raised">
          {playlists.length === 0 ? (
            <p className="px-2.5 py-2 text-xs text-neu-muted">
              재생목록이 없습니다. 사이드바에서 먼저 만들어주세요.
            </p>
          ) : (
            playlists.map((playlist) => {
              const isMember = memberSet.has(playlist.id);
              return (
                <button
                  key={playlist.id}
                  type="button"
                  disabled={isMember || addMutation.isPending}
                  onClick={() => addMutation.mutate(playlist.id)}
                  className="flex w-full items-center justify-between gap-2 rounded-[10px] px-2.5 py-2 text-left text-[12.5px] font-semibold text-neu-ink hover:bg-[rgba(120,100,145,0.09)] disabled:cursor-default disabled:text-neu-muted disabled:hover:bg-transparent"
                >
                  <span className="truncate">{playlist.title}</span>
                  {isMember && (
                    <CheckIcon className="flex-none text-neu-hi" />
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
