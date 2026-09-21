import { useMemo, useState } from "react";
import type { Track } from "@/features/library/lib/tracks";

// 탐색 화면의 태그 선택 상태(제안 태그/직접 입력한 커스텀 태그/선택된 태그)를
// 모읍니다. 이전 추가 결과(성공/실패 메시지)를 지우는 건 이 훅의 책임이 아니라
// 호출부(ExplorePage)가 addTrackMutation.reset()을 같이 불러서 처리합니다.
export function useTagSelection(libraryTracks: Track[]) {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // 태그 제안 목록: 라이브러리에 이미 쓰인 태그를 곡수 내림차순으로 보여줍니다.
  const suggestedTags = useMemo(() => {
    const counts = new Map<string, number>();
    libraryTracks.forEach((t) =>
      t.tags.forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1)),
    );
    return Array.from(counts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }, [libraryTracks]);

  const allTags = [...suggestedTags.map((t) => t.tag), ...customTags];

  function toggleTag(tag: string) {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }

  function handleAddTagInput() {
    const tag = tagInput.trim().replace(/^#+/, "");
    if (!tag) return;
    if (!allTags.includes(tag)) setCustomTags((prev) => [...prev, tag]);
    setSelectedTags((prev) => new Set(prev).add(tag));
    setTagInput("");
  }

  function reset() {
    setSelectedTags(new Set());
  }

  return {
    suggestedTags,
    allTags,
    selectedTags,
    tagInput,
    setTagInput,
    toggleTag,
    handleAddTagInput,
    reset,
  };
}
