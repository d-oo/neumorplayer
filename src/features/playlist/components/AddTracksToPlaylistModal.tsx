import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { Track } from "@/features/library/lib/tracks";
import {
  addTracksToPlaylist,
  invalidatePlaylistMembership,
  type PlaylistWithCount,
} from "../lib/playlists";
import { usePlaylists } from "../hooks/usePlaylists";
import { useToastStore } from "@/shared/lib/useToastStore";
import Modal from "@/shared/components/Modal";
import ModalHeader from "@/shared/components/ModalHeader";
import ModalCancelButton from "@/shared/components/ModalCancelButton";

// 재생목록 상세에서 선택한 곡들을 다른 재생목록 하나에 추가하는 모달(선택 액션 바의
// [재생목록에 추가]). 곡 상세의 AddToPlaylistButton 모달(여러 재생목록 체크/해제 →
// [적용])과 겉모습(제목/부제목/행/하단 버튼)은 맞추되 동작이 달라서 따로 둡니다:
// - 재생목록은 하나만 고르고, 행을 누르는 즉시 추가하고 닫습니다(체크박스·[적용] 없음).
// - 지금 보고 있는 재생목록은 목록에서 아예 뺍니다.
// - 선택 곡 중 대상에 이미 있는 곡은 조용히 건너뜁니다(addTracksToPlaylist).
export default function AddTracksToPlaylistModal({
  open,
  onClose,
  currentPlaylistId,
  tracks,
  onAdded,
}: {
  open: boolean;
  onClose: () => void;
  currentPlaylistId: string;
  // 현재 재생목록 순서대로 정렬된 선택 곡들 — 이 순서 그대로 대상 끝에 붙습니다.
  tracks: Track[];
  onAdded: () => void;
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const showToast = useToastStore((s) => s.show);

  const { data: playlists = [] } = usePlaylists(open);
  const targets = playlists.filter((p) => p.id !== currentPlaylistId);

  const addMutation = useMutation({
    mutationFn: (target: PlaylistWithCount) =>
      addTracksToPlaylist(
        target.id,
        tracks.map((t) => t.id),
      ),
    onSuccess: (addedCount, target) => {
      invalidatePlaylistMembership(queryClient, user?.id, {
        playlistIds: [target.id],
        trackIds: tracks.map((t) => t.id),
      });
      showToast(
        addedCount > 0
          ? `「${target.title}」에 ${addedCount}곡을 추가했습니다.`
          : "이미 모두 들어 있는 곡입니다.",
      );
      onAdded();
    },
  });

  function close() {
    addMutation.reset();
    onClose();
  }

  const subtitle =
    tracks.length === 1
      ? `${tracks[0].title} · ${tracks[0].artist.join(", ")}`
      : `${tracks.length}곡 선택됨`;

  return (
    <Modal open={open} onClose={close} className="w-93 px-5.5 pt-5.5 pb-5">
      <ModalHeader title="재생목록에 추가" subtitle={subtitle} />

      <div className="flex max-h-64 flex-col gap-1 overflow-y-auto">
        {targets.length === 0 ? (
          <p className="px-1 py-2 text-xs text-neu-muted">
            추가할 다른 재생목록이 없습니다. 사이드바에서 먼저 만들어주세요.
          </p>
        ) : (
          targets.map((playlist) => (
            <button
              key={playlist.id}
              type="button"
              disabled={addMutation.isPending}
              onClick={() => addMutation.mutate(playlist)}
              className="flex items-center gap-2.75 rounded-[11px] px-3 py-2.5 text-left select-none enabled:hover:bg-neu-accent-tint disabled:cursor-default disabled:opacity-60"
            >
              <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-neu-ink">
                {playlist.title}
              </span>
              <span className="flex-none font-neu-mono text-[11.5px] text-neu-muted">
                {playlist.trackCount}곡
              </span>
            </button>
          ))
        )}
      </div>

      {addMutation.isError && (
        <p className="text-xs text-red-500">추가하지 못했습니다.</p>
      )}

      <div className="h-px bg-neu-divider" />

      <div className="flex items-center justify-end">
        <ModalCancelButton onClick={close} />
      </div>
    </Modal>
  );
}
