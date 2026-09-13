import type { ReactNode } from "react";
import { useAuth } from "./useAuth";
import LoginPage from "./LoginPage";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return null; // 원하면 스피너로 교체
  if (!user) return <LoginPage />;

  return <>{children}</>;
}
