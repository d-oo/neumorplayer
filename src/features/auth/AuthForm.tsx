import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react";

// LoginPage/SignupPage가 공유하는 작은 폼 조각들. 인증 화면을 더 추가할 땐
// AuthLayout과 함께 이 컴포넌트들을 재사용하세요.

export function Field({
  label,
  id,
  ...inputProps
}: { label: string; id: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-semibold text-muted">
        {label}
      </label>
      <input
        id={id}
        className="w-full rounded-[10px] border border-border bg-field px-3.5 py-2.75 text-sm text-text outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-muted focus-visible:border-accent focus-visible:shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent)_25%,transparent)]"
        {...inputProps}
      />
    </div>
  );
}

export function PrimaryButton({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className="mt-1 w-full rounded-[10px] bg-accent px-4 py-3 text-sm font-semibold text-accent-text transition-colors duration-150 enabled:hover:bg-accent-hover enabled:active:scale-[0.98] disabled:cursor-default disabled:opacity-55"
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
      className="flex w-full items-center justify-center gap-2.5 rounded-[10px] border border-border bg-surface px-4 py-2.75 text-sm font-semibold text-text transition-colors duration-150 hover:bg-surface-hover"
      {...props}
    >
      {children}
    </button>
  );
}

export function Divider({ children }: { children: ReactNode }) {
  return (
    <div className="my-4.5 flex items-center gap-3 text-xs text-muted before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
      {children}
    </div>
  );
}

export function FormError({ children }: { children: ReactNode }) {
  return <p className="mt-0.5 text-[13px] text-danger">{children}</p>;
}
