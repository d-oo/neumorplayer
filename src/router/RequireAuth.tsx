import { useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";

// 로그아웃 상태면 막아서 다른 곳으로 보내는데, 어디로 보낼지는 "이 화면을 보는 동안
// 로그인해 있었는지"로 나눕니다.
// - 로그인해 있다가 로그아웃된 경우(프로필 메뉴의 로그아웃, 회원탈퇴, 다른 탭에서
//   로그아웃 등): 랜딩("/")으로 — "/"에서는 HomeAccessGate가 비로그인 사용자에게
//   LandingPage를 보여줍니다.
// - 처음부터 로그인 안 한 채 보호된 주소(/explore 등)로 들어온 경우: 지금처럼 /login.
// 로그아웃 버튼에서 signOut() 뒤에 navigate("/")를 부르는 방식은 "로그아웃됨"과 "이동"
// 중 무엇이 먼저 그려지느냐에 따라 /login이 한 번 스칠 수 있어서, 여기서 한 번에
// 정합니다. 이 컴포넌트는 HomeLayout 아래 하위 라우트를 오가도 같은 인스턴스로 남아
// 있어서(HomeAccessGate가 감싸는 자리 그대로) 로그인 이력이 유지됩니다.
export default function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const [wasSignedIn, setWasSignedIn] = useState(false);
  if (user && !wasSignedIn) setWasSignedIn(true);

  if (loading) return null; // 원하면 스피너로 교체
  if (!user) return <Navigate to={wasSignedIn ? "/" : "/login"} replace />;

  return <>{children}</>;
}
