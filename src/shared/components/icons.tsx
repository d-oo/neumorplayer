// docs/design/의 시안(1b 뉴모피즘 대시보드)에 쓰인 아이콘 모양을 그대로 재사용한
// 단순 벡터 아이콘들입니다.
type IconProps = { className?: string };

export function PlayIcon({ className }: IconProps) {
  return (
    <svg
      width="11"
      height="12"
      viewBox="0 0 20 22"
      className={className}
      aria-hidden
    >
      <polygon points="0,0 20,11 0,22" fill="currentColor" />
    </svg>
  );
}

export function PauseIcon({ className }: IconProps) {
  return (
    <svg
      width="10"
      height="12"
      viewBox="0 0 18 22"
      className={className}
      aria-hidden
    >
      <rect
        x="1.4"
        y="0"
        width="5.6"
        height="22"
        rx="1.5"
        fill="currentColor"
      />
      <rect x="11" y="0" width="5.6" height="22" rx="1.5" fill="currentColor" />
    </svg>
  );
}

export function PrevIcon({ className }: IconProps) {
  return (
    <svg
      width="15"
      height="13"
      viewBox="0 0 18 16"
      className={className}
      aria-hidden
    >
      <rect x="0" y="0" width="2.6" height="16" fill="currentColor" />
      <polygon points="18,0 18,16 4.5,8" fill="currentColor" />
    </svg>
  );
}

export function NextIcon({ className }: IconProps) {
  return (
    <svg
      width="15"
      height="13"
      viewBox="0 0 18 16"
      className={className}
      aria-hidden
    >
      <polygon points="0,0 0,16 13.5,8" fill="currentColor" />
      <rect x="15.4" y="0" width="2.6" height="16" fill="currentColor" />
    </svg>
  );
}

export function ShuffleIcon({ className }: IconProps) {
  return (
    <svg
      width="15"
      height="13"
      viewBox="0 0 18 16"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M1 3h3.2l7.4 10h2.6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M1 13h3.2l7.4-10h2.6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <polygon points="13.4,0.6 17.4,3 13.4,5.4" fill="currentColor" />
      <polygon points="13.4,10.6 17.4,13 13.4,15.4" fill="currentColor" />
    </svg>
  );
}

export function RepeatIcon({ className }: IconProps) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 18 18"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M2.4 9A6.6 6.6 0 0 1 13.2 5.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <polygon points="11.2,2.3 16.2,5.5 11.4,8.4" fill="currentColor" />
      <path
        d="M15.6 9A6.6 6.6 0 0 1 4.8 12.8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <polygon points="6.8,9.6 1.8,12.5 6.6,15.7" fill="currentColor" />
    </svg>
  );
}

export function QueueIcon({ className }: IconProps) {
  return (
    <svg
      width="16"
      height="15"
      viewBox="0 0 18 16"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M1 2.4h11M1 7h11M1 11.6h6.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M13.6 9v5.6M10.8 11.8h5.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SearchGlyphIcon({ className }: IconProps) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      aria-hidden
    >
      <circle
        cx="6.6"
        cy="6.6"
        r="4.9"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M10.4 10.4L14.4 14.4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 14 14"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M7 0.8v12.4M0.8 7h12.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function XIcon({ className }: IconProps) {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 14 14"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M1 1l12 12M13 1L1 13"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg
      width="12"
      height="10"
      viewBox="0 0 14 11"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M1 5.5l4 4L13 1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// 재생목록 정보/트랙 상세의 "수정" 버튼(아직 플레이스홀더 — docs/todos.md 참고).
export function PencilIcon({ className }: IconProps) {
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
        d="M12.4 2.6l3 3-8.5 8.5-3.6.9.9-3.6 8.2-8.8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TrashIcon({ className }: IconProps) {
  return (
    <svg
      width="13"
      height="14"
      viewBox="0 0 13 14"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M1 3.4h11M4.6 3.4V1.6a1 1 0 0 1 1-1h1.8a1 1 0 0 1 1 1v1.8M2.4 3.4l.6 9a1 1 0 0 0 1 .9h5a1 1 0 0 0 1-.9l.6-9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// LibraryPage의 정렬 옵션 버튼이 오름차순/내림차순을 나타내는 데 쓰는 삼각형
// 화살표 — desc가 true면 180도 돌려 아래쪽을 가리키게 합니다.
export function SortArrowIcon({
  desc,
  className,
}: IconProps & { desc: boolean }) {
  return (
    <svg
      width="8"
      height="6"
      viewBox="0 0 8 6"
      aria-hidden
      className={className}
      style={{ transform: desc ? "rotate(180deg)" : "rotate(0deg)" }}
    >
      <polygon points="4,0 8,6 0,6" fill="currentColor" />
    </svg>
  );
}

// 헤더 프로필 드롭다운 트리거의 캐럿 — open이면 180도 돌려 위를 가리키게 합니다.
export function CaretIcon({
  open,
  className,
}: IconProps & { open: boolean }) {
  return (
    <svg
      width="10"
      height="7"
      viewBox="0 0 10 7"
      fill="none"
      className={className}
      style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
      aria-hidden
    >
      <path
        d="M1 1.4L5 5.2 9 1.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SettingsIcon({ className }: IconProps) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 18 18"
      fill="none"
      className={className}
      aria-hidden
    >
      <circle cx="9" cy="9" r="2.6" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M9 1.4v2.2M9 14.4v2.2M1.4 9h2.2M14.4 9h2.2M3.6 3.6l1.6 1.6M12.8 12.8l1.6 1.6M14.4 3.6l-1.6 1.6M5.2 12.8l-1.6 1.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LogoutIcon({ className }: IconProps) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 18 18"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M7 2.4H3.4v13.2H7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M10.4 5.6L13.8 9l-3.4 3.4M13.8 9H7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SunIcon({ className }: IconProps) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 18 18"
      fill="none"
      className={className}
      aria-hidden
    >
      <circle cx="9" cy="9" r="3.4" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M9 1.4v2M9 14.6v2M1.4 9h2M14.6 9h2M3.6 3.6l1.4 1.4M13 13l1.4 1.4M14.4 3.6L13 5M5 13l-1.4 1.4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MoonIcon({ className }: IconProps) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 18 18"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M15.4 10.8A6.6 6.6 0 1 1 7.2 2.6a5.2 5.2 0 0 0 8.2 8.2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DragHandleIcon({ className }: IconProps) {
  return (
    <svg
      width="8"
      height="14"
      viewBox="0 0 8 14"
      className={className}
      aria-hidden
    >
      {[0, 1, 2].map((row) =>
        [0, 1].map((col) => (
          <circle
            key={`${row}-${col}`}
            cx={col * 6 + 1}
            cy={row * 6 + 1}
            r="1.3"
            fill="currentColor"
          />
        )),
      )}
    </svg>
  );
}
