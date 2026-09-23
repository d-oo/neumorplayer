import { fieldBoxStyle } from "@/shared/styles/field-box-style";

// 태그 직접 입력창(라벨+pill 입력+추가 버튼)과 제안/커스텀 태그 토글 목록을 두
// 컴포넌트로 나눠 둡니다 — ExplorePage에서 입력 행은 비디오 ID 입력칸과 같은 줄에
// 놓고, 칩 목록은 그 아래 전체 너비로 펼쳐야 해서 한 덩어리로는 배치할 수 없습니다.
// 둘 다 useTagSelection 훅이 들고 있는 상태를 그대로 props로 받는 순수 렌더링
// 컴포넌트입니다.
export function TagInputRow({
  tagInput,
  onTagInputChange,
  onAddTagInput,
}: {
  tagInput: string;
  onTagInputChange: (value: string) => void;
  onAddTagInput: () => void;
}) {
  return (
    <div>
      <div className="mb-2.25 text-[11.5px] font-bold tracking-[0.06em] text-neu-muted">
        태그
      </div>
      <div className="flex items-center gap-2.25">
        <div
          className="flex w-60 items-center gap-2 rounded-full border border-(--neu-border-80) px-3.75 py-2.25"
          style={fieldBoxStyle}
        >
          <span className="flex-none text-[13.5px] font-bold text-(--neu-ink-55)">
            #
          </span>
          <input
            value={tagInput}
            onChange={(e) => onTagInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAddTagInput();
              }
            }}
            placeholder="태그 직접 입력"
            className="min-w-0 flex-1 bg-transparent text-[13px] font-semibold text-(--neu-ink-25) outline-none"
          />
        </div>
        <button
          type="button"
          onClick={onAddTagInput}
          disabled={!tagInput.trim()}
          className="rounded-full px-4 py-2.25 text-[13px] font-bold whitespace-nowrap transition-[background,box-shadow] duration-150 [background:var(--neu-cta-pill-grad)] text-neu-hi shadow-neu-cta-pill enabled:hover:[background:var(--neu-cta-pill-grad-hover)] enabled:hover:shadow-neu-cta-pill-hover enabled:active:shadow-neu-pill-active disabled:[background:var(--neu-ink-928)] disabled:text-(--neu-ink-58) disabled:shadow-neu-cta-pill-disabled disabled:cursor-default"
        >
          태그 추가
        </button>
      </div>
    </div>
  );
}

export function TagChipList({
  allTags,
  suggestedTags,
  selectedTags,
  onToggleTag,
}: {
  allTags: string[];
  suggestedTags: { tag: string; count: number }[];
  selectedTags: Set<string>;
  onToggleTag: (tag: string) => void;
}) {
  return (
    <div className="mb-7 flex flex-wrap gap-2.25">
      {allTags.map((tag) => {
        const isOn = selectedTags.has(tag);
        const count = suggestedTags.find((t) => t.tag === tag)?.count;
        return (
          <button
            key={tag}
            type="button"
            onClick={() => onToggleTag(tag)}
            className="flex items-baseline gap-2 rounded-full border px-3.75 py-2.25"
            style={{
              background: isOn ? "var(--neu-ink-912)" : "var(--neu-surface)",
              boxShadow: isOn
                ? "var(--neu-shadow-chip-active)"
                : "var(--neu-shadow-chip-raised)",
              borderColor: isOn ? "var(--neu-border-70)" : "var(--neu-border-80)",
              color: isOn ? "var(--neu-hi)" : "var(--neu-ink)",
            }}
          >
            <span className="text-[13.5px] font-bold">#{tag}</span>
            {count !== undefined && (
              <span className="text-xs opacity-68">{count}곡</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
