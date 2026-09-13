import { useParams } from "react-router-dom";

// old-src/src/components/MusicInfo.js 를 대체할 자리.
// TODO: useQuery로 tracks 단건 조회 + 수정/삭제 폼(react-hook-form + zod 추천).
export default function MusicInfoPage() {
  const { musicId } = useParams<{ musicId: string }>();
  return (
    <div>
      <h2>음악 정보</h2>
      <p>track id: {musicId}</p>
    </div>
  );
}
