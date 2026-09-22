import Modal from "@/shared/components/Modal";
import { XIcon } from "@/shared/components/icons";

// PrivacyBanner의 "자세히 보기"에서 띄우는 개인정보 처리방침 본문 모달.
// docs/todos.md의 "개인정보 처리방침/이용약관 페이지 신설" 항목이 아직 별도 라우트로
// 만들어지기 전 단계라, 우선 이 모달 하나에 내용을 담아 배너에서 바로 확인할 수 있게
// 합니다 — 실제 /privacy 라우트가 생기면 본문을 그쪽으로 옮기고 여기선 링크만 남기면
// 됩니다.
export default function PrivacyPolicyModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      className="w-137.5 max-w-full px-6.5 pt-6 pb-5.5"
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-base font-extrabold tracking-[-0.02em]">
          개인정보 처리방침
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="grid size-7 flex-none place-items-center rounded-full text-[oklch(0.5_0.02_315)] hover:text-[oklch(0.2_0.025_315)]"
        >
          <XIcon />
        </button>
      </div>

      <div className="flex max-h-100 flex-col gap-4 overflow-y-auto pr-1 text-[13px] leading-[1.7] text-[oklch(0.35_0.025_315)]">
        <p>
          NeumorPlayer는 아래와 같이 이용자의 정보를 수집·이용합니다. 본
          서비스는 YouTube API Services를 사용합니다.
        </p>

        <section className="flex flex-col gap-1.5">
          <p className="font-bold text-neu-ink">1. 수집하는 정보</p>
          <ul className="list-disc space-y-1 pl-4.5">
            <li>회원가입 시: 이메일 주소(Supabase Auth를 통해 저장)</li>
            <li>
              서비스 이용 중: 라이브러리에 저장한 트랙, 재생목록, 검색으로
              조회한 YouTube 동영상 정보(제목, 채널명, 썸네일, 재생시간,
              조회수 등 YouTube Data API 응답값)
            </li>
            <li>
              비회원(게스트)으로 검색·재생만 이용하는 경우 검색어나 재생
              기록을 서버에 저장하지 않으며, 페이지를 벗어나면 사라집니다.
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-1.5">
          <p className="font-bold text-neu-ink">2. 정보 이용 목적</p>
          <ul className="list-disc space-y-1 pl-4.5">
            <li>회원 인증 및 라이브러리·재생목록 기능 제공</li>
            <li>검색 결과 제공을 위한 YouTube Data API 연동</li>
          </ul>
        </section>

        <section className="flex flex-col gap-1.5">
          <p className="font-bold text-neu-ink">3. 제3자 서비스</p>
          <ul className="list-disc space-y-1 pl-4.5">
            <li>Supabase: 회원 인증 및 데이터베이스 인프라</li>
            <li>
              YouTube Data API(Google): 동영상 검색 및 메타데이터 제공. 이
              서비스는 YouTube API Services를 사용하며,{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-neu-hi underline"
              >
                Google 개인정보처리방침
              </a>
              이 함께 적용됩니다.
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-1.5">
          <p className="font-bold text-neu-ink">4. 아동 대상 콘텐츠</p>
          <p>
            YouTube에서 Made For Kids로 지정한 동영상은 검색 결과에서
            제외합니다.
          </p>
        </section>

        <section className="flex flex-col gap-1.5">
          <p className="font-bold text-neu-ink">5. 보관 및 삭제</p>
          <p>
            저장된 정보는 회원 탈퇴 시 삭제됩니다. 프로필 메뉴의 설정 →
            회원탈퇴에서 직접 삭제를 요청할 수 있습니다.
          </p>
        </section>

        <section className="flex flex-col gap-1.5">
          <p className="font-bold text-neu-ink">6. 관련 문서</p>
          <p>
            본 서비스 이용 시{" "}
            <a
              href="https://www.youtube.com/t/terms"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-neu-hi underline"
            >
              YouTube 서비스 약관
            </a>
            에도 동의하는 것으로 간주됩니다.
          </p>
        </section>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full px-5 py-2.25 text-[13px] font-bold text-neu-hi [background:var(--neu-cta-pill-grad)] shadow-neu-cta-pill hover:[background:var(--neu-cta-pill-grad-hover)] hover:shadow-neu-cta-pill-hover active:shadow-neu-pill-active"
        >
          닫기
        </button>
      </div>
    </Modal>
  );
}
