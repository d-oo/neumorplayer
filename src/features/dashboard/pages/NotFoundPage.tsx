import { useDocumentTitle } from "@/shared/lib/useDocumentTitle";

export default function NotFoundPage() {
  useDocumentTitle("NeumorPlayer");
  return <h2>페이지를 찾을 수 없습니다.</h2>;
}
