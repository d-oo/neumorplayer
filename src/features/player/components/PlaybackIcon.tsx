import { PauseIcon, PlayIcon, SpinnerIcon } from "@/shared/components/icons";

// 재생 버튼 안의 아이콘 — 불러오는 중이면 스피너, 재생 중이면 일시정지, 아니면 재생
// 삼각형(lib/playback-display.ts의 세 가지 표시 상태). CD 플레이어 가운데 버튼(CdDisc)과
// 트랙 상세/재생목록의 44px 재생 버튼(PlayPauseButton)이 같은 규칙으로 그립니다.
export default function PlaybackIcon({
  playing,
  loading,
}: {
  playing: boolean;
  loading: boolean;
}) {
  if (loading) return <SpinnerIcon className="animate-spin" />;
  if (playing) return <PauseIcon />;
  return <PlayIcon className="ml-0.5" />;
}
