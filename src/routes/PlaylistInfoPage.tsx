import { useParams } from "react-router-dom";

// old-src/src/components/PlaylistInfo.js 를 대체할 자리.
// TODO: playlist_tracks를 position 순으로 조회 + dnd-kit으로 순서 변경 시 position batch update.
export default function PlaylistInfoPage() {
  const { playlistId } = useParams<{ playlistId: string }>();
  return (
    <div>
      <h2>재생목록</h2>
      <p>playlist id: {playlistId}</p>
    </div>
  );
}
