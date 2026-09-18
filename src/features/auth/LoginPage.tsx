import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./useAuth";
import AuthLayout from "./AuthLayout";
import GoogleIcon from "./GoogleIcon";
import {
  Field,
  PrimaryButton,
  GoogleButton,
  Divider,
  FormError,
} from "./AuthForm";

export default function LoginPage() {
  const { signInWithGoogle, signInWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signInWithEmail(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="다시 오셨네요"
      subtitle="로그인하고 내 라이브러리를 이어서 들어보세요."
      footer={
        <>
          계정이 없으신가요?{" "}
          <Link
            className="font-semibold text-accent hover:underline"
            to="/signup"
          >
            회원가입
          </Link>
        </>
      }
    >
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <Field
          id="login-email"
          label="이메일"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <Field
          id="login-password"
          label="비밀번호"
          type="password"
          placeholder="••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          minLength={6}
        />
        {error ? <FormError>{error}</FormError> : null}
        <PrimaryButton type="submit" disabled={submitting}>
          {submitting ? "로그인 중..." : "로그인"}
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
