import { useState, type FormEvent } from "react";
import { useAuth } from "./useAuth";

export default function LoginPage() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "signIn") {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: "80px auto", padding: "0 16px" }}>
      <h1>ytmusic</h1>

      <button type="button" onClick={() => void signInWithGoogle()}>
        Google로 계속하기
      </button>

      <hr />

      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        {error ? <p style={{ color: "crimson" }}>{error}</p> : null}
        <button type="submit" disabled={submitting}>
          {mode === "signIn" ? "로그인" : "회원가입"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => setMode(mode === "signIn" ? "signUp" : "signIn")}
      >
        {mode === "signIn" ? "계정이 없으신가요? 회원가입" : "로그인으로 돌아가기"}
      </button>
    </div>
  );
}
