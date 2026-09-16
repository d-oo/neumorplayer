import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./useAuth";
import AuthLayout from "./AuthLayout";
import GoogleIcon from "./GoogleIcon";
import { Field, PrimaryButton, GoogleButton, Divider, FormError } from "./AuthForm";

export default function SignupPage() {
  const { signInWithGoogle, signUpWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
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
      title="계정 만들기"
      subtitle="가입하고 내 음악 라이브러리를 만들어보세요."
      footer={
        <>
          이미 계정이 있으신가요?{" "}
          <Link className="font-semibold text-accent hover:underline" to="/login">
            로그인
          </Link>
        </>
      }
    >
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
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
        <Field
          id="signup-password"
          label="비밀번호"
          type="password"
          placeholder="6자 이상"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
          minLength={6}
        />
        <Field
          id="signup-password-confirm"
          label="비밀번호 확인"
          type="password"
          placeholder="••••••"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          autoComplete="new-password"
          required
          minLength={6}
        />
        {error ? <FormError>{error}</FormError> : null}
        <PrimaryButton type="submit" disabled={submitting}>
          {submitting ? "가입 중..." : "회원가입"}
        </PrimaryButton>
      </form>

      <Divider>또는</Divider>

      <GoogleButton onClick={() => void signInWithGoogle()}>
        <GoogleIcon />
        Google로 계속하기
      </GoogleButton>
    </AuthLayout>
  );
}
