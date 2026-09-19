import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return null; // 원하면 스피너로 교체
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
