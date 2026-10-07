import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useDocumentTitle } from "@/shared/lib/useDocumentTitle";
import { useAuth } from "../hooks/useAuth";
import { useAuthSubmit } from "../hooks/useAuthSubmit";
import LegalDocumentModal, {
  type LegalDoc,
} from "@/features/legal/components/LegalDocumentModal";
import AuthLayout from "../components/AuthLayout";
import GoogleIcon from "../components/GoogleIcon";
import {
  Divider,
  Field,
  FormError,
  GoogleButton,
  LegalDocButton,
  PasswordField,
  PrimaryButton,
} from "../components/AuthForm";

export default function LoginPage() {
  useDocumentTitle("로그인 - NeumorPlayer");
  const { signInWithGoogle, signInWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { error, submitting, submit } = useAuthSubmit("로그인에 실패했습니다.");
  const [legalDoc, setLegalDoc] = useState<LegalDoc | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await submit(() => signInWithEmail(email, password));
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

        {/* 위아래 여백(my-0.75)은 로그인 카드 세로 길이를 회원가입 카드와 똑같이
            맞추려고 넣은 값입니다 — 원래 두 폼의 높이 차 30px를 반씩(my-3.75) 채웠는데,
            Google 버튼 아래 동의 안내 문구(간격 8px + 줄 높이 16px = 24px)가 그중 24px를
            가져가서 남은 6px만 반씩 둡니다. SignupPage 폼 구성이나 안내 문구가 바뀌면
            이 값도 다시 맞춰야 합니다. */}
        <Divider className="my-0.75">또는</Divider>

        {/* Google 로그인은 여기에만 있음 — OAuth는 별도 회원가입 절차 없이 바로
            로그인되므로 SignupPage엔 두지 않았습니다. 그래서 회원가입의 동의 체크박스를
            거치지 않는 Google 사용자에게는 버튼 바로 아래 안내 문구로 이용약관·개인정보
            처리방침 동의를 받습니다(YouTube API Developer Policies III.A — 기능을 쓰기
            전에 개인정보처리방침 동의 필요). 한 줄을 넘기면 카드 높이가 회원가입과
            달라지니 문구를 늘리지 마세요. */}
        <div className="flex flex-col gap-2">
          <GoogleButton onClick={() => void signInWithGoogle()}>
            <GoogleIcon />
            Google로 계속하기
          </GoogleButton>
          <p className="text-center text-[11px] leading-4 text-neu-muted">
            계속하면{" "}
            <LegalDocButton onClick={() => setLegalDoc("terms")}>
              이용약관
            </LegalDocButton>
            과{" "}
            <LegalDocButton onClick={() => setLegalDoc("privacy")}>
              개인정보처리방침
            </LegalDocButton>
            에 동의하는 것으로 간주합니다.
          </p>
        </div>
      </form>

      <LegalDocumentModal doc={legalDoc} onClose={() => setLegalDoc(null)} />
    </AuthLayout>
  );
}
