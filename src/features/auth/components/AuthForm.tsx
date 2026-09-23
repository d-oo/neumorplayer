import {
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { CheckIcon, EmailIcon, EyeIcon, LockIcon } from "./icons";
import CheckBox from "@/shared/components/CheckBox";

// LoginPage/SignupPage가 공유하는 폼 조각들. docs/design/의 "데스크탑 로그인 및
// 회원가입 화면" 시안을 그대로 옮겼습니다 — 인증 화면을 더 추가할 땐 AuthLayout과
// 함께 이 컴포넌트들을 재사용하세요.

const fieldRowClass =
  "flex h-12 items-center gap-2.5 rounded-[13px] border border-white/70";

const fieldRowStyle = {
  background: "var(--neu-surface-sunken)",
  boxShadow:
    "inset 3px 3px 7px rgba(150,136,175,0.38), inset -3px -3px 6px rgba(255,255,255,0.88)",
};

const fieldInputClass =
  "min-w-0 flex-1 border-none bg-transparent text-sm text-neu-ink outline-none placeholder:text-neu-muted";

const fieldLabelClass =
  "font-neu-mono text-[10px] tracking-[0.14em] text-[oklch(0.5_0.025_315)]";

// 지금은 이메일 입력에만 쓰이지만 아이콘만 바꾸면 다른 입력에도 그대로 쓸 수 있어서
// icon을 prop으로 받습니다(기본값은 기존 그대로 이메일 아이콘).
export function Field({
  label,
  id,
  icon = <EmailIcon className="flex-none text-[oklch(0.55_0.02_315)]" />,
  ...inputProps
}: {
  label: string;
  id: string;
  icon?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1.75">
      <label htmlFor={id} className={fieldLabelClass}>
        {label}
      </label>
      <div className={`${fieldRowClass} px-3.5`} style={fieldRowStyle}>
        {icon}
        <input id={id} className={fieldInputClass} {...inputProps} />
      </div>
    </div>
  );
}

export function PasswordField({
  label,
  id,
  ...inputProps
}: { label: string; id: string } & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
>) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col gap-1.75">
      <label htmlFor={id} className={fieldLabelClass}>
        {label}
      </label>
      <div className={`${fieldRowClass} pr-2 pl-3.5`} style={fieldRowStyle}>
        <LockIcon className="flex-none text-[oklch(0.55_0.02_315)]" />
        <input
          id={id}
          type={visible ? "text" : "password"}
          className={fieldInputClass}
          {...inputProps}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          title="비밀번호 표시"
          aria-label="비밀번호 표시"
          className="grid size-8.5 flex-none place-items-center rounded-full"
          style={{
            color: visible ? "var(--neu-hi)" : "oklch(0.52 0.02 315)",
            background: "var(--neu-surface)",
            boxShadow: visible
              ? "inset 3px 3px 7px rgba(146,132,170,0.6), inset -2px -2px 6px rgba(255,255,255,0.9)"
              : "3px 3px 8px rgba(146,132,170,0.45), -2px -2px 6px rgba(255,255,255,0.95)",
          }}
        >
          <EyeIcon hidden={!visible} />
        </button>
      </div>
    </div>
  );
}

export function AgreeCheckbox({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
}) {
  return (
    <div
      onClick={() => onChange(!checked)}
      className="flex cursor-pointer items-start gap-2.25 py-0.5 select-none"
    >
      <CheckBox checked={checked} className="mt-px">
        <CheckIcon />
      </CheckBox>
      <div className="text-[12.5px] leading-[1.6] text-[oklch(0.42_0.025_315)]">
        {children}
      </div>
    </div>
  );
}

// docs/design/수정본2.zip(Auth Screens.dc.html)부터 이 버튼은 앱 전역 pill CTA와
// 같은 --neu-cta-pill-grad/text-neu-hi/--neu-shadow-cta-pill을 씁니다 — 9/19 원본
// 시안의 진보라 배경+흰 글자(--neu-cta-grad)는 이 zip으로 대체된 값이니 되돌리지
// 마세요. active 그림자만 그 zip에 --neu-shadow-pill-active와 미묘히 다른 값으로
// 박혀 있어 전용 토큰(--neu-shadow-auth-cta-active)을 씁니다.
export function PrimaryButton({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className="grid h-12.5 place-items-center rounded-[14px] [background:var(--neu-cta-pill-grad)] text-[14.5px] font-bold tracking-[-0.01em] text-neu-hi shadow-neu-cta-pill transition-[background,box-shadow] duration-150 enabled:hover:[background:var(--neu-cta-pill-grad-hover)] enabled:active:shadow-neu-auth-cta-active disabled:cursor-default disabled:opacity-60"
      {...props}
    >
      {children}
    </button>
  );
}

export function GoogleButton({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className="flex h-12.5 items-center justify-center gap-2.5 rounded-[14px] border border-white/80 bg-neu-surface text-sm font-bold text-[oklch(0.32_0.025_315)] shadow-neu-google transition-shadow duration-150 active:shadow-neu-google-active"
      {...props}
    >
      {children}
    </button>
  );
}

export function Divider({ children }: { children: ReactNode }) {
  const lineStyle = {
    background: "var(--neu-surface-sunken)",
    boxShadow:
      "inset 1px 1px 2px rgba(150,136,175,0.5), inset -1px -1px 2px rgba(255,255,255,0.9)",
  };
  return (
    <div className="flex items-center gap-3">
      <div className="h-0.5 flex-1 rounded-xs" style={lineStyle} />
      <div className="font-neu-mono text-[10px] tracking-[0.16em] text-[oklch(0.55_0.02_315)]">
        {children}
      </div>
      <div className="h-0.5 flex-1 rounded-xs" style={lineStyle} />
    </div>
  );
}

export function FormError({ children }: { children: ReactNode }) {
  return <p className="text-[12.5px] text-red-600">{children}</p>;
}
