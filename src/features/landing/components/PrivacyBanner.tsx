import { useState } from "react";
import CloseButton from "@/shared/components/CloseButton";
import { secondaryPillButtonClass } from "@/shared/styles/secondary-button-class";
import PrivacyPolicyModal from "./PrivacyPolicyModal";

const DISMISSED_KEY = "neumorplayer-privacy-banner-dismissed";

function readDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

function persistDismissed() {
  try {
    localStorage.setItem(DISMISSED_KEY, "1");
  } catch {
    // 프라이빗 모드 등으로 저장이 막혀도 배너 자체는 정상 동작해야 하므로 무시합니다.
  }
}

// YouTube API Developer Policies III.A: 게스트가 검색·재생 기능에 접근하기 전에
// 개인정보 처리방침을 눈에 띄게 고지해야 합니다. 로그인 사용자는 SignupPage의
// 동의 체크박스를 이미 거쳤으므로, 이 배너는 LandingPage(비로그인 전용 화면)에만
// 둡니다. 모달/체크박스로 강제 동의를 받는 대신 가볍게 고지만 하고, "자세히 보기"나
// "확인" 어느 쪽을 눌러도 이후 재방문 시 다시 뜨지 않도록 로컬에 기록합니다.
export default function PrivacyBanner() {
  const [dismissed, setDismissed] = useState(readDismissed);
  const [modalOpen, setModalOpen] = useState(false);

  function dismiss() {
    persistDismissed();
    setDismissed(true);
  }

  function openDetails() {
    setModalOpen(true);
    dismiss();
  }

  // 배너를 닫아도(dismissed) 방금 그 클릭으로 연 모달은 계속 떠 있어야 하므로,
  // 이 둘의 렌더링을 하나의 early return으로 묶지 않고 따로 둡니다.
  return (
    <>
      {!dismissed && (
        <div
          className="fixed inset-x-0 bottom-5 z-30 mx-auto flex w-137.5 max-w-[calc(100%-2.75rem)] items-center justify-between gap-4 rounded-2xl border border-white/80 bg-neu-surface px-5.5 py-3.5 shadow-neu-raised"
          role="status"
        >
          <p className="text-[12.5px] leading-[1.55] text-[oklch(0.35_0.025_315)]">
            NeumorPlayer는 YouTube API Services를 사용하며, 검색·재생을 위해
            최소한의 정보를 수집합니다.
          </p>
          <div className="flex flex-none items-center gap-2">
            <button
              type="button"
              onClick={openDetails}
              className={`px-4 py-2 text-[12.5px] text-[oklch(0.4_0.025_315)] hover:text-[oklch(0.24_0.025_315)] ${secondaryPillButtonClass}`}
            >
              자세히 보기
            </button>
            <CloseButton onClick={dismiss} />
          </div>
        </div>
      )}

      <PrivacyPolicyModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
