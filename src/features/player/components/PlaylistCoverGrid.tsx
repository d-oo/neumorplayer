import TrackThumbnail from "@/shared/components/TrackThumbnail";

// 재생목록의 앞 4곡(position순) video_id로 2x2 썸네일 콜라주를 그립니다. 4곡보다
// 적으면 남는 칸은 빈 공간으로 둡니다. 각 칸의 실제 썸네일 로드/대체 로직은
// TrackThumbnail이 담당합니다(재생목록 전체가 아니라 칸 단위로 대체되므로, 나머지
// 칸의 실제 썸네일은 그대로 보여줍니다).
export default function PlaylistCoverGrid({
  videoIds,
  className,
}: {
  videoIds: string[];
  className?: string;
}) {
  const cells = Array.from({ length: 4 }, (_, i) => videoIds[i] ?? null);
  return (
    <div
      className={`grid grid-cols-2 grid-rows-2 overflow-hidden ${className ?? ""}`}
    >
      {cells.map((videoId, i) =>
        videoId ? (
          <TrackThumbnail key={i} videoId={videoId} className="h-full w-full" />
        ) : (
          <div key={i} />
        ),
      )}
    </div>
  );
}
