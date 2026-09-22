import { useState } from "react";
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
import IconCircleButton from "@/shared/components/IconCircleButton";
import Modal from "@/shared/components/Modal";

// old-src/src/components/MusicInfo.js의 "playlist_add" 흐름을 이어받습니다.
// PlayerPanel(현재 재생 곡)과 MusicInfoPage(곡 상세)가 정확히 같은 동작을 필요로 해서
// 여기 한 곳으로 뽑았습니다. docs/design/수정본2.zip부터 드롭다운이 아니라 화면
// 중앙 모달로 바뀌었고, 여러 재생목록을 체크한 뒤 "추가" 버튼으로 한 번에 커밋하는
// 방식입니다(이미 들어있는 재생목록은 체크된 채로 비활성 표시 — 여기서 빼는 기능은
// 없고, 빼는 건 PlaylistInfoPage의 트랙 행에서 합니다). 트리거는 항상 원형
// 아이콘이라(트랙 상세도 시안에서 알약이 아니라 44px 원형으로 바뀜) 크기만
// `size`로 받습니다.
export default function AddToPlaylistButton({
  track,
  size,
}: {
  track: Track;
  size: "lg" | "xl";
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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
    mutationFn: (playlistIds: string[]) =>
      Promise.all(playlistIds.map((id) => addTrackToPlaylist(id, track.id))),
    onSuccess: (_data, playlistIds) => {
      queryClient.invalidateQueries({
        queryKey: playlistMembershipQueryKey(track.id),
      });
      queryClient.invalidateQueries({ queryKey: playlistsQueryKey(user?.id) });
      playlistIds.forEach((id) =>
        queryClient.invalidateQueries({
          queryKey: playlistTracksQueryKey(id),
        }),
      );
      setOpen(false);
    },
  });

  function openModal() {
    addMutation.reset();
    setSelectedIds(new Set(memberSet));
    setOpen(true);
  }

  function toggle(playlistId: string) {
    if (memberSet.has(playlistId)) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(playlistId)) next.delete(playlistId);
      else next.add(playlistId);
      return next;
    });
  }

  function commit() {
    const newIds = Array.from(selectedIds).filter((id) => !memberSet.has(id));
    if (newIds.length === 0) {
      setOpen(false);
      return;
    }
    addMutation.mutate(newIds);
  }

  return (
    <>
      <IconCircleButton
        size={size}
        onClick={openModal}
        title={isQueued ? "재생목록에 추가됨" : "재생목록에 추가"}
        aria-label={isQueued ? "재생목록에 추가됨" : "재생목록에 추가"}
        aria-pressed={isQueued}
        className="flex-none text-[oklch(0.52_0.02_315)] shadow-neu-raised-sm hover:text-neu-hi active:shadow-neu-sunken"
      >
        <QueueIcon />
      </IconCircleButton>
      {addMutation.isSuccess && (
        <span className="ml-2 text-[12px] font-semibold text-neu-hi">
          추가했습니다
        </span>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        className="w-93 px-5.5 pt-5.5 pb-5"
      >
        <div>
          <p className="text-base font-extrabold tracking-[-0.02em]">
            재생목록에 추가
          </p>
          <p className="mt-1.25 text-[12.5px] text-neu-muted">
            {track.title} · {track.artist.join(", ")}
          </p>
        </div>

        <div className="flex max-h-64 flex-col gap-1 overflow-y-auto">
          {playlists.length === 0 ? (
            <p className="px-1 py-2 text-xs text-neu-muted">
              재생목록이 없습니다. 사이드바에서 먼저 만들어주세요.
            </p>
          ) : (
            playlists.map((playlist) => {
              const isMember = memberSet.has(playlist.id);
              const isChecked = isMember || selectedIds.has(playlist.id);
              return (
                <button
                  key={playlist.id}
                  type="button"
                  disabled={isMember}
                  onClick={() => toggle(playlist.id)}
                  className="flex items-center gap-2.75 rounded-[11px] px-3 py-2.5 text-left select-none hover:bg-neu-accent-tint disabled:cursor-default"
                >
                  <span
                    className="grid h-5 w-5 flex-none place-items-center rounded-md"
                    style={{
                      background: isChecked
                        ? "linear-gradient(145deg, #8127b8, #5c1287)"
                        : "oklch(0.908 0.014 315)",
                      boxShadow: isChecked
                        ? "3px 3px 7px rgba(124,94,164,0.45), -2px -2px 6px rgba(255,255,255,0.9)"
                        : "inset 3px 3px 6px rgba(150,136,175,0.5), inset -2px -2px 5px rgba(255,255,255,0.9)",
                    }}
                  >
                    {isChecked && <CheckIcon className="text-white" />}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-neu-ink">
                    {playlist.title}
                  </span>
                  <span className="flex-none font-neu-mono text-[11.5px] text-neu-muted">
                    {playlist.trackCount}곡
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div className="h-px bg-[rgba(142,128,166,0.28)]" />

        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full border border-white/85 px-4.5 py-2.25 text-[13px] font-semibold text-[oklch(0.4_0.025_315)] shadow-neu-pill-secondary hover:text-[oklch(0.24_0.025_315)] active:shadow-neu-pill-active"
          >
            취소
          </button>
          <button
            type="button"
            onClick={commit}
            disabled={addMutation.isPending}
            className="rounded-full px-5 py-2.25 text-[13px] font-bold text-neu-hi [background:var(--neu-cta-pill-grad)] shadow-neu-cta-pill enabled:hover:[background:var(--neu-cta-pill-grad-hover)] enabled:hover:shadow-neu-cta-pill-hover enabled:active:shadow-neu-pill-active disabled:cursor-default disabled:opacity-60"
          >
            추가
          </button>
        </div>
      </Modal>
    </>
  );
}
