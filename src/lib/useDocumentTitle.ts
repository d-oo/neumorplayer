import { useEffect } from "react";

// 여러 라우트 페이지가 공유하는 훅이라 특정 feature에 속하지 않고 src/lib/에 둡니다
// (todos.md의 shared/ 통합 전까지는 src/lib/이 공유 코드 자리).
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}
