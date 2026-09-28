import type { MouseEvent } from "react";
import { formatDuration } from "@/shared/lib/format-time";
import IconCircleButton from "@/shared/components/IconCircleButton";
import { PlayIcon } from "@/shared/components/icons";
import EqualizerBars from "./EqualizerBars";

// 트랙 목록 행의 "재생시간" 칸 — 평소엔 재생시간 글자를 보여주다가 행에 마우스를
// 올리면(또는 행 안의 무언가에 키보드 포커스가 있으면) 같은 자리가 재생 버튼으로
// 바뀝니다. 라이브러리/헤더 검색 결과/재생목록 상세/사이드바 "재생 트랙" 탭이 공유합니다.
// isCurrent(지금 재생 중인 곡)면 hover와 상관없이 막대 이퀄라이저만 보여주고 재생
// 버튼은 두지 않습니다 — 같은 맥락의 현재 곡 재생 버튼은 어차피 아무 동작도 안 합니다
// (usePlayerStore.playTrackFrom 참고). 재생목록 상세와 "재생 트랙" 탭만 이걸 켭니다.
//
// 재생은 오직 이 버튼으로만 시작됩니다 — YouTube Required Minimum Functionality의
// "재생을 시작시키는 썸네일은 최소 120×70px" 규칙 때문에, 행의 작은 썸네일이나 행
// 클릭이 재생을 트리거하지 않도록 한 것입니다(docs/change.md).
//
// 호출부의 행 요소에 `group/track` 클래스가 있어야 hover가 동작합니다. 글자·버튼·
// 이퀄라이저를 같은 grid 칸에 겹쳐 두고(최소 폭은 버튼 크기 min-w-7), 현재 곡일 때도
// 재생시간 글자를 invisible로 남겨 칸 폭을 유지하므로 상태가 바뀌어도 행 레이아웃이
// 흔들리지 않습니다. 버튼을 visibility가 아니라 opacity로 숨기는 이유는 Tab으로
// 포커스가 들어올 수 있어야 해서입니다(invisible 요소는 포커스를 못 받음).
//
// 재생시간 글자의 pointer-events-none은 지우면 안 됩니다: hover 때 글자가
// opacity-0이 되면 opacity < 1이라 stacking context가 생겨 일반 요소인 버튼보다
// 위에 그려지고, 투명해도 클릭은 받으므로 버튼 클릭을 전부 가로챕니다(실제로 겪음).
export default function DurationPlayButton({
  duration,
  onPlay,
  label,
  align,
  textClassName,
  isCurrent = false,
}: {
  duration: number;
  onPlay: () => void;
  label: string;
  // 재생시간 글자와 버튼을 칸의 어느 쪽에 붙일지 — 기존 재생시간 정렬을 그대로 따릅니다.
  align: "start" | "end";
  textClassName: string;
  isCurrent?: boolean;
}) {
  const justify = align === "end" ? "justify-items-end" : "justify-items-start";

  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    // 라이브러리/검색 결과는 행 클릭이 상세 페이지 이동이라 버튼 클릭이 거기까지
    // 번지지 않게 막습니다.
    e.stopPropagation();
    onPlay();
  }

  return (
    <div className={`grid min-w-7 items-center ${justify}`}>
      <span
        className={`pointer-events-none col-start-1 row-start-1 ${
          isCurrent
            ? "invisible"
            : "group-hover/track:opacity-0 group-has-focus-visible/track:opacity-0"
        } ${textClassName}`}
      >
        {formatDuration(duration)}
      </span>
      {isCurrent ? (
        <EqualizerBars className="col-start-1 row-start-1" />
      ) : (
        <IconCircleButton
          size="sm"
          onClick={handleClick}
          aria-label={label}
          className="col-start-1 row-start-1 text-neu-hi opacity-0 shadow-neu-raised-sm group-hover/track:opacity-100 group-has-focus-visible/track:opacity-100"
        >
          <PlayIcon className="ml-0.5" />
        </IconCircleButton>
      )}
    </div>
  );
}
