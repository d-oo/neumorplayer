import { useEffect } from "react";
import { useToastStore } from "@/shared/lib/useToastStore";
import CloseButton from "./CloseButton";

const VISIBLE_MS = 3000;

// 화면 왼쪽 하단에 잠깐 떴다가 fade out되는 알림(old-src Alert.js 대응 — 원본은
// 오른쪽 하단이었지만 사용자 요청으로 왼쪽 하단에 둡니다. 사이드바 QueueCard 아래쪽
// 위에 겹치는 건 알고 있고, 어색하면 나중에 옮기기로 한 상태입니다). 표시 시간과
// 나타남/사라짐 속도(0.2s/1.2s)도 원본 그대로입니다.
//
// fade out이 보이려면 요소가 계속 마운트되어 있어야 해서 조건부 렌더링 대신
// opacity + invisible로 숨깁니다(invisible은 transition 끝에 적용되어 숨은 동안
// 클릭을 가로채지 않음). 단, 사용자가 X로 직접 닫으면(dismiss) fade 없이 바로
// 사라집니다(duration-0 — 사용자 요청). 모양은 PrivacyBanner(떠 있는 하단 배너)와
// 같은 surface/테두리/그림자 토큰을 써서 라이트/다크 테마를 그대로 따라갑니다.
// HomeLayout에 한 번만 마운트합니다.
export default function Toast() {
  const message = useToastStore((s) => s.message);
  const id = useToastStore((s) => s.id);
  const visible = useToastStore((s) => s.visible);
  const instant = useToastStore((s) => s.instant);
  const hide = useToastStore((s) => s.hide);
  const dismiss = useToastStore((s) => s.dismiss);

  const stateClass = visible
    ? "visible opacity-100 duration-200"
    : `invisible opacity-0 ${instant ? "duration-0" : "duration-1200"}`;

  useEffect(() => {
    if (!visible) return;
    const timeout = window.setTimeout(hide, VISIBLE_MS);
    return () => window.clearTimeout(timeout);
  }, [id, visible, hide]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-5 left-5 z-40 flex max-w-[calc(100%-2.5rem)] items-center gap-2 rounded-2xl border border-(--neu-border-80) bg-neu-surface py-2.5 pr-2.5 pl-4.5 shadow-neu-raised transition-[opacity,visibility] ${stateClass}`}
    >
      <p className="truncate text-[12.5px] font-semibold text-(--neu-ink-35)">
        {message}
      </p>
      <CloseButton onClick={dismiss} />
    </div>
  );
}
