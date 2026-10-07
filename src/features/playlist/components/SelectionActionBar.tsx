import { secondaryPillButtonClass } from "@/shared/styles/secondary-button-class";

const actionButtonClass = `whitespace-nowrap px-4 py-2 text-[12.5px] disabled:cursor-default disabled:opacity-60 ${secondaryPillButtonClass}`;

// 재생목록 상세에서 곡을 하나 이상 선택하면 뜨는 하단 액션 바(old-src PlaylistInfo.js의
// selectedMenu 대응). 시안이 없어서 앱의 기존 "떠 있는 하단 바"인 PrivacyBanner와 같은
// surface/테두리/그림자 토큰, 모달·배너의 보조 알약 버튼(secondaryPillButtonClass)으로
// 맞췄습니다 — 전부 --neu-* 토큰이라 라이트/다크 테마를 그대로 따라갑니다.
//
// 위치: HomeLayout의 본문 영역 래퍼(relative)를 기준으로 absolute 배치해서, 본문(main)이
// 스크롤돼도 본문 영역 하단(푸터 바로 위)에 떠 있습니다(HomeLayout 주석 참고). 가운데가 아니라 왼쪽
// (본문 좌우 여백 26px에 맞춤)에 두는 이유는 화면 오른쪽 하단의 미니 플레이어
// (YouTubePlayer, 368×207)와 겹치지 않게 하기 위해서입니다.
export default function SelectionActionBar({
  count,
  onRemove,
  onAddToPlaylist,
  onClear,
  isRemoving,
}: {
  count: number;
  onRemove: () => void;
  onAddToPlaylist: () => void;
  onClear: () => void;
  isRemoving: boolean;
}) {
  return (
    <div
      role="toolbar"
      aria-label="선택한 곡"
      className="absolute bottom-5 left-6.5 z-20 flex items-center gap-2 rounded-2xl border border-(--neu-border-80) bg-neu-surface py-2.5 pr-2.5 pl-4.5 shadow-neu-raised"
    >
      <p className="mr-1.5 whitespace-nowrap text-[13px] font-bold text-neu-hi">
        {count}곡 선택됨
      </p>
      <div className="mr-1 h-5 w-px bg-neu-divider" />
      <button
        type="button"
        onClick={onRemove}
        disabled={isRemoving}
        className={`text-(--neu-danger) enabled:hover:text-(--neu-danger-hover) ${actionButtonClass}`}
      >
        재생목록에서 삭제
      </button>
      <button
        type="button"
        onClick={onAddToPlaylist}
        className={`text-(--neu-ink-40) hover:text-(--neu-ink-24) ${actionButtonClass}`}
      >
        재생목록에 추가
      </button>
      <button
        type="button"
        onClick={onClear}
        className={`text-(--neu-ink-40) hover:text-(--neu-ink-24) ${actionButtonClass}`}
      >
        선택 취소
      </button>
    </div>
  );
}
