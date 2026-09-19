import {
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { CheckIcon, EmailIcon, EyeIcon, LockIcon } from "./icons";

// LoginPage/SignupPage가 공유하는 폼 조각들. docs/design/의 "데스크탑 로그인 및
// 회원가입 화면" 시안을 그대로 옮겼습니다 — 인증 화면을 더 추가할 땐 AuthLayout과
// 함께 이 컴포넌트들을 재사용하세요.

const fieldRowClass =
  "flex h-12 items-center gap-2.5 rounded-[13px] border border-white/70";

const fieldRowStyle = {
  background: "oklch(0.908 0.014 315)",
  boxShadow:
    "inset 3px 3px 7px rgba(150,136,175,0.38), inset -3px -3px 6px rgba(255,255,255,0.88)",
};

const fieldInputClass =
  "min-w-0 flex-1 border-none bg-transparent text-sm text-neu-ink outline-none placeholder:text-neu-muted";

const fieldLabelClass =
  "font-neu-mono text-[10px] tracking-[0.14em] text-[oklch(0.5_0.025_315)]";

export function Field({
  label,
  id,
  ...inputProps
}: { label: string; id: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1.75">
      <label htmlFor={id} className={fieldLabelClass}>
        {label}
      </label>
      <div className={`${fieldRowClass} px-3.5`} style={fieldRowStyle}>
        <EmailIcon className="flex-none text-[oklch(0.55_0.02_315)]" />
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
            background: "oklch(0.935 0.013 315)",
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
      <div
        className="mt-px grid size-5 flex-none place-items-center rounded-[6px]"
        style={{
          background: checked
            ? "linear-gradient(145deg, #8127b8, #5c1287)"
            : "oklch(0.908 0.014 315)",
          boxShadow: checked
            ? "3px 3px 7px rgba(124,94,164,0.45), -2px -2px 6px rgba(255,255,255,0.9)"
            : "inset 3px 3px 6px rgba(150,136,175,0.5), inset -2px -2px 5px rgba(255,255,255,0.9)",
        }}
      >
        {checked ? <CheckIcon /> : null}
      </div>
      <div className="text-[12.5px] leading-[1.6] text-[oklch(0.42_0.025_315)]">
        {children}
      </div>
    </div>
  );
}

export function PrimaryButton({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className="grid h-12.5 place-items-center rounded-[14px] [background:var(--neu-cta-grad)] text-[14.5px] font-extrabold tracking-[-0.01em] text-white shadow-neu-cta transition-[background,box-shadow] duration-150 enabled:hover:[background:var(--neu-cta-grad-hover)] enabled:active:shadow-neu-cta-active disabled:cursor-default disabled:opacity-60"
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
    background: "oklch(0.908 0.014 315)",
    boxShadow:
      "inset 1px 1px 2px rgba(150,136,175,0.5), inset -1px -1px 2px rgba(255,255,255,0.9)",
  };
  return (
    <div className="flex items-center gap-3">
      <div className="h-0.5 flex-1 rounded-[2px]" style={lineStyle} />
      <div className="font-neu-mono text-[10px] tracking-[0.16em] text-[oklch(0.55_0.02_315)]">
        {children}
      </div>
      <div className="h-0.5 flex-1 rounded-[2px]" style={lineStyle} />
    </div>
  );
}

export function FormError({ children }: { children: ReactNode }) {
  return <p className="text-[12.5px] text-[#dc2626]">{children}</p>;
}
