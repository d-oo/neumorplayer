import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useVideoSlot } from "@/features/player/useVideoSlot";

// old-src/src/components/MusicInfo.js 를 대체할 자리.
// TODO: useQuery로 tracks 단건 조회 + 수정/삭제 폼(react-hook-form + zod 추천).
// 재생 버튼은 조회한 track으로 usePlayerStore.playQueue([track], 0)를 호출하면 됩니다.
//
// 아래 div는 HomeLayout에 항상 마운트되어 있는 YouTubePlayer가 포탈링해 들어오는
// 자리입니다(이 페이지를 벗어나면 다시 화면 밖 오프스크린 컨테이너로 돌아가 배경
// 재생을 유지합니다) — useVideoSlot 자체를 지우지 마세요.
export default function MusicInfoPage() {
  const { musicId } = useParams<{ musicId: string }>();
  const containerRef = useRef<HTMLDivElement>(null);
  const { setSlotEl } = useVideoSlot();

  useEffect(() => {
    setSlotEl(containerRef.current);
    return () => setSlotEl(null);
  }, [setSlotEl]);

  return (
    <div>
      <h2>음악 정보</h2>
      <p>track id: {musicId}</p>
      <div
        ref={containerRef}
        className="mt-4 aspect-video w-full max-w-xl overflow-hidden rounded-xl bg-black"
      />
    </div>
  );
}
