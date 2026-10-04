import { useState } from "react";

// 로그인/회원가입 폼이 공유하는 제출 상태(오류 문구, 제출 중 여부). submit에 넘긴
// 작업이 실패하면 그 오류 메시지를, 메시지가 없는 오류면 fallbackMessage를 보여줍니다.
// 제출 전 입력값 검사(회원가입의 비밀번호 확인 등)는 화면마다 달라서 호출부가
// setError로 직접 처리합니다.
export function useAuthSubmit(fallbackMessage: string) {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(action: () => Promise<void>) {
    setError(null);
    setSubmitting(true);
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : fallbackMessage);
    } finally {
      setSubmitting(false);
    }
  }

  return { error, setError, submitting, submit };
}
