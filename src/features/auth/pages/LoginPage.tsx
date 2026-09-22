import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useDocumentTitle } from "@/shared/lib/useDocumentTitle";
import { useAuth } from "../hooks/useAuth";
import AuthLayout from "../components/AuthLayout";
import GoogleIcon from "../components/GoogleIcon";
import {
  Divider,
  Field,
  FormError,
  GoogleButton,
  PasswordField,
  PrimaryButton,
} from "../components/AuthForm";

export default function LoginPage() {
  useDocumentTitle("로그인 - NeumorPlayer");
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
      title="로그인"
      subtitle={
        <>
          좋아하는 음악과 재생목록을
          <br />
          저장해보세요.
        </>
      }
      footer={
        <>
          계정이 없으신가요?{" "}
          <Link className="font-bold text-neu-hi hover:underline" to="/signup">
            회원가입
          </Link>
        </>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
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
        <PasswordField
          id="login-password"
          label="비밀번호"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          minLength={6}
        />
        {/* 시안 초안엔 "로그인 상태 유지" 체크박스와 "비밀번호 찾기" 링크가 있었지만
            실수로 들어간 항목이라 최신 시안에서 이미 빠졌습니다 — 다시 넣지 마세요. */}
        {error ? <FormError>{error}</FormError> : null}
        <PrimaryButton type="submit" disabled={submitting}>
          {submitting ? "로그인 중..." : "로그인"}
        </PrimaryButton>

        <Divider>또는</Divider>

        {/* Google 로그인은 여기에만 있음 — OAuth는 별도 회원가입 절차 없이 바로
            로그인되므로 SignupPage엔 두지 않았습니다. */}
        <GoogleButton onClick={() => void signInWithGoogle()}>
          <GoogleIcon />
          Google로 계속하기
        </GoogleButton>
      </form>
    </AuthLayout>
  );
}
