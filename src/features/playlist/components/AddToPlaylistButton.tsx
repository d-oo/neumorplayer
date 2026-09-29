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
  removeTrackFromPlaylist,
} from "../lib/playlists";
import { usePlayerStore } from "@/features/player/lib/usePlayerStore";
import type { Track } from "@/features/library/lib/tracks";
import { CheckIcon, QueueIcon } from "@/shared/components/icons";
import { useToastStore } from "@/shared/lib/useToastStore";
import { secondaryPillButtonClass } from "@/shared/styles/secondary-button-class";
import CheckBox from "@/shared/components/CheckBox";
import IconCircleButton from "@/shared/components/IconCircleButton";
import Modal from "@/shared/components/Modal";
import ModalCtaButton from "@/shared/components/ModalCtaButton";

// old-src/src/components/MusicInfo.js의 "playlist_add" 흐름을 이어받습니다.
// MusicInfoPage(곡 상세)가 이 흐름을 그대로 씁니다(PlayerPanel은 이 자리에 "음악
// 정보" 버튼을 대신 두고 곡 상세 페이지로 이동시킵니다 — 재생목록 추가는 그 상세
// 페이지에서 하면 됩니다). docs/design/수정본2.zip부터 드롭다운이 아니라 화면
// 중앙 모달로 바뀌었고, 재생목록을 체크/해제한 뒤 "적용" 버튼으로 한 번에 커밋하는
// 방식입니다 — 모달을 열 때 이미 들어있는 재생목록이 체크된 상태로 시작하고, 새로
// 체크한 곳엔 추가, 체크를 푼 곳에선 제거합니다. 트리거는 시안대로 44px 원형 아이콘
// 하나뿐입니다.
export default function AddToPlaylistButton({ track }: { track: Track }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const playingPlaylistId = usePlayerStore((s) => s.playingPlaylistId);
  const currentTrackId = usePlayerStore((s) =>
    s.currentIndex >= 0 ? s.queue[s.currentIndex]?.id : undefined,
  );
  const detachCurrentFromPlaylist = usePlayerStore(
    (s) => s.detachCurrentFromPlaylist,
  );
  const showToast = useToastStore((s) => s.show);

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

  const applyMutation = useMutation({
    mutationFn: ({
      addIds,
      removeIds,
    }: {
      addIds: string[];
      removeIds: string[];
    }) =>
      Promise.all([
        ...addIds.map((id) => addTrackToPlaylist(id, track.id)),
        ...removeIds.map((id) => removeTrackFromPlaylist(id, track.id)),
      ]),
    onSuccess: (_data, { addIds, removeIds }) => {
      queryClient.invalidateQueries({
        queryKey: playlistMembershipQueryKey(track.id),
      });
      queryClient.invalidateQueries({ queryKey: playlistsQueryKey(user?.id) });
      [...addIds, ...removeIds].forEach((id) =>
        queryClient.invalidateQueries({
          queryKey: playlistTracksQueryKey(id),
        }),
      );
      setOpen(false);
      showToast("재생목록에 반영했습니다.");
    },
  });

  function openModal() {
    applyMutation.reset();
    setSelectedIds(new Set(memberSet));
    setOpen(true);
  }

  function toggle(playlistId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(playlistId)) next.delete(playlistId);
      else next.add(playlistId);
      return next;
    });
  }

  function commit() {
    const addIds = Array.from(selectedIds).filter((id) => !memberSet.has(id));
    const removeIds = memberPlaylistIds.filter((id) => !selectedIds.has(id));
    if (addIds.length === 0 && removeIds.length === 0) {
      setOpen(false);
      return;
    }
    // PlaylistInfoPage의 handleRemoveTrack과 같은 이유 — 지금 재생 중인 이 곡을
    // 그 곡이 재생 중인 재생목록에서 빼는 경우, 제거 전에 먼저 단독 재생으로
    // 떼어내야 큐가 DB에서 빠진 순서를 계속 참조하지 않습니다.
    if (
      currentTrackId === track.id &&
      playingPlaylistId !== null &&
      removeIds.includes(playingPlaylistId)
    ) {
      detachCurrentFromPlaylist();
    }
    applyMutation.mutate({ addIds, removeIds });
  }

  return (
    <>
      <IconCircleButton
        size="xl"
        onClick={openModal}
        title={isQueued ? "재생목록에 추가됨" : "재생목록에 추가"}
        aria-label={isQueued ? "재생목록에 추가됨" : "재생목록에 추가"}
        aria-pressed={isQueued}
        className="flex-none text-(--neu-ink-52) shadow-neu-raised-sm hover:text-neu-hi active:shadow-neu-sunken"
      >
        <QueueIcon />
      </IconCircleButton>
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
              const isChecked = selectedIds.has(playlist.id);
              return (
                <button
                  key={playlist.id}
                  type="button"
                  onClick={() => toggle(playlist.id)}
                  className="flex items-center gap-2.75 rounded-[11px] px-3 py-2.5 text-left select-none hover:bg-neu-accent-tint"
                >
                  <CheckBox checked={isChecked}>
                    <CheckIcon className="text-white" />
                  </CheckBox>
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

        <div className="h-px bg-neu-divider" />

        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className={`px-4.5 py-2.25 text-[13px] text-(--neu-ink-40) hover:text-(--neu-ink-24) ${secondaryPillButtonClass}`}
          >
            취소
          </button>
          <ModalCtaButton onClick={commit} disabled={applyMutation.isPending}>
            적용
          </ModalCtaButton>
        </div>
      </Modal>
    </>
  );
}
