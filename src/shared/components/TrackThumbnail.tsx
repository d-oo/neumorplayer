import { useState } from "react";
import { getYoutubeThumbnailUrl } from "@/shared/lib/youtube-thumbnail";
import { thumbnailPlaceholderBackground } from "@/shared/styles/thumbnail-placeholder-style";

// 여러 트랙 목록(라이브러리, 재생목록 상세, 사이드바 "다음 트랙", 헤더 검색 결과)이
// 공유하는 썸네일 셀 — 특정 도메인 소유가 아닌 순수 UI라 shared/components에 있습니다.
// 실제 유튜브 썸네일을 시도하고, 로드에 실패하거나(onError) YouTube가 삭제/비공개
// 영상에 내려주는 120x90 "썸네일 없음" 대체 이미지가 감지되면(실제 mqdefault는
// 320x180) 기존 스트라이프 placeholder로 바꿔치기합니다. 크기/모서리/테두리/그림자는
// 호출부가 감싸는 `ThumbBox`가 담당하고, 이 컴포넌트는 그 안을 h-full w-full로
// 채우기만 합니다(PlaylistCoverGrid의 콜라주 칸도 이 컴포넌트를 그대로 재사용).
export default function TrackThumbnail({
  videoId,
  quality,
  className,
}: {
  videoId: string;
  quality?: "medium" | "high";
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={className}
        style={{ background: thumbnailPlaceholderBackground }}
      />
    );
  }
  return (
    <img
      src={getYoutubeThumbnailUrl(videoId, quality)}
      alt=""
      loading="lazy"
      className={`object-cover ${className ?? ""}`}
      onError={() => setFailed(true)}
      onLoad={(e) => {
        const img = e.currentTarget;
        if (img.naturalWidth === 120 && img.naturalHeight === 90)
          setFailed(true);
      }}
    />
  );
}
