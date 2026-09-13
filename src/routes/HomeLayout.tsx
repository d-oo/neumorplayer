import { Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth";

// old-src/src/Home.js 가 하던 역할(Player + Playlists 사이드바 + 메인 컨텐츠 레이아웃)의
// 자리만 잡아둔 뼈대입니다. Player/Playlists/YT 컴포넌트는 기능 구현 단계에서 채워 넣으세요.
export default function HomeLayout() {
  const { user, signOut } = useAuth();

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: "100vh" }}>
      <aside style={{ borderRight: "1px solid #ddd", padding: 16 }}>
        <p>{user?.email}</p>
        <button type="button" onClick={() => void signOut()}>
          로그아웃
        </button>
        {/* TODO: Playlists 목록 */}
        {/* TODO: Player 컨트롤러 */}
      </aside>
      <main style={{ padding: 16 }}>
        <Outlet />
      </main>
    </div>
  );
}
