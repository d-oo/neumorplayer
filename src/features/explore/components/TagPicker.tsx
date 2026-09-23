import { fieldBoxStyle } from "@/shared/styles/field-box-style";

// 태그 직접 입력창 + 제안/커스텀 태그 토글 목록. useTagSelection 훅이 들고 있는
// 상태를 그대로 props로 받는 순수 렌더링 컴포넌트입니다.
export default function TagPicker({
  tagInput,
  onTagInputChange,
  onAddTagInput,
  allTags,
  suggestedTags,
  selectedTags,
  onToggleTag,
}: {
  tagInput: string;
  onTagInputChange: (value: string) => void;
  onAddTagInput: () => void;
  allTags: string[];
  suggestedTags: { tag: string; count: number }[];
  selectedTags: Set<string>;
  onToggleTag: (tag: string) => void;
}) {
  return (
    <>
      <div className="mb-3.5 text-[11.5px] font-bold tracking-[0.06em] text-neu-muted">
        태그
      </div>
      <div className="mb-3 flex items-center gap-2.25">
        <div
          className="flex w-60 items-center gap-2 rounded-full border border-white/80 px-3.75 py-2.25"
          style={fieldBoxStyle}
        >
          <span className="flex-none text-[13.5px] font-bold text-[oklch(0.55_0.02_315)]">
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
            className="min-w-0 flex-1 bg-transparent text-[13px] font-semibold text-[oklch(0.25_0.025_315)] outline-none"
          />
        </div>
        <button
          type="button"
          onClick={onAddTagInput}
          disabled={!tagInput.trim()}
          className="rounded-full border border-white/80 bg-neu-surface px-4 py-2.25 text-[13px] font-bold whitespace-nowrap text-neu-hi shadow-neu-tint-pill transition-[background,box-shadow] duration-150 enabled:hover:[background:var(--neu-hover-tint-grad)] enabled:hover:shadow-neu-tag-add-hover enabled:active:shadow-neu-sunken disabled:text-[oklch(0.58_0.02_315)] disabled:cursor-default"
        >
          태그 추가
        </button>
      </div>

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
                background: isOn
                  ? "oklch(0.912 0.014 315)"
                  : "var(--neu-surface)",
                boxShadow: isOn
                  ? "inset 3px 3px 7px rgba(150,136,175,0.4), inset -3px -3px 6px rgba(255,255,255,0.85)"
                  : "var(--neu-shadow-chip-raised)",
                borderColor: isOn
                  ? "rgba(255,255,255,0.7)"
                  : "rgba(255,255,255,0.8)",
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
    </>
  );
}
