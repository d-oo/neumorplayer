// docs/design/의 시안("데스크탑 로그인 및 회원가입 화면")에 쓰인 아이콘 모양을 그대로
// 재사용한 단순 벡터 아이콘들입니다.
type IconProps = { className?: string };

export function EmailIcon({ className }: IconProps) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 18 18"
      fill="none"
      className={className}
      aria-hidden
    >
      <rect
        x="1"
        y="3.2"
        width="16"
        height="11.6"
        rx="2.4"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M2 5l7 4.6L16 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LockIcon({ className }: IconProps) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 18 18"
      fill="none"
      className={className}
      aria-hidden
    >
      <rect
        x="2.6"
        y="7.6"
        width="12.8"
        height="9"
        rx="2.4"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M5.6 7.6V5.4a3.4 3.4 0 0 1 6.8 0v2.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function EyeIcon({
  hidden,
  className,
}: IconProps & { hidden: boolean }) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 18 18"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M1 9s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="9" cy="9" r="2.2" stroke="currentColor" strokeWidth="1.5" />
      {hidden ? (
        <path
          d="M2.6 2.6l12.8 12.8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      ) : null}
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg
      width="11"
      height="9"
      viewBox="0 0 12 10"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M1 5.2l3.2 3.2L11 1.4"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
