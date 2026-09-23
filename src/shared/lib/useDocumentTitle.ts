import { useEffect } from "react";

// 여러 라우트 페이지가 공유하는 훅이고 어떤 feature의 도메인도 대표하지 않아
// shared/lib에 둡니다.
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}
