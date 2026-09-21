import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useDocumentTitle } from "@/shared/lib/useDocumentTitle";
import { useAuth } from "../hooks/useAuth";
import AuthLayout from "../components/AuthLayout";
import {
  AgreeCheckbox,
  Field,
  FormError,
  PasswordField,
  PrimaryButton,
} from "../components/AuthForm";

export default function SignupPage() {
  useDocumentTitle("회원가입 - NeumorPlayer");
  const { signUpWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!agreed) {
      setError("이용약관과 개인정보 처리방침에 동의해야 합니다.");
      return;
    }

    setSubmitting(true);
    try {
      await signUpWithEmail(email, password);
      // 가입 확인 이메일을 꺼둔 상태라 성공하면 바로 세션이 생기고,
      // GuestOnly가 이를 감지해서 자동으로 메인 화면으로 보내줍니다.
    } catch (err) {
      setError(err instanceof Error ? err.message : "회원가입에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      heading="이메일로 회원가입"
      title="계정 만들기"
      subtitle={
        <>
          이메일 하나면 충분합니다. 가입 즉시
          <br />
          재생목록을 만들 수 있어요.
        </>
      }
      footer={
        <>
          이미 계정이 있으신가요?{" "}
          <Link className="font-bold text-neu-hi hover:underline" to="/login">
            로그인
          </Link>
        </>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Field
          id="signup-email"
          label="이메일"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <PasswordField
          id="signup-password"
          label="비밀번호"
          placeholder="8자 이상"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
          minLength={8}
        />
        <PasswordField
          id="signup-password-confirm"
          label="비밀번호 확인"
          placeholder="••••••••"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          autoComplete="new-password"
          required
          minLength={8}
        />
        <AgreeCheckbox checked={agreed} onChange={setAgreed}>
          서비스 이용약관과 개인정보 처리방침에 동의합니다.
        </AgreeCheckbox>
        {error ? <FormError>{error}</FormError> : null}
        <PrimaryButton type="submit" disabled={submitting}>
          {submitting ? "가입 중..." : "회원가입"}
        </PrimaryButton>
      </form>
    </AuthLayout>
  );
}
