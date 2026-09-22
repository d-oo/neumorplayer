import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import LandingPage from "@/features/landing/pages/LandingPage";
import RequireAuth from "./RequireAuth";

// "/" 전용 가드입니다. 로그인 사용자는 지금처럼 RequireAuth를 거쳐 HomeLayout(대시보드)을
// 보고, 비로그인 사용자가 정확히 "/"로 오면 /login으로 보내는 대신 그 자리에서
// LandingPage를 직접 렌더링합니다(HomeLayout을 거치지 않으므로 대시보드 셸이 아예
// 마운트되지 않습니다). "/"의 하위 경로(/explore, /music/:id 등)는 location.pathname이
// "/"가 아니므로 RequireAuth로 위임되어 지금과 동일하게 /login으로 리다이렉트됩니다.
export default function HomeAccessGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!user && location.pathname === "/") return <LandingPage />;

  return <RequireAuth>{children}</RequireAuth>;
}
