import { useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import LoginPage from "@/features/auth/pages/LoginPage";
import SignupPage from "@/features/auth/pages/SignupPage";
import HomeLayout from "@/features/dashboard/pages/HomeLayout";
import LibraryPage from "@/features/library/pages/LibraryPage";
import ExplorePage from "@/features/explore/pages/ExplorePage";
import MusicInfoPage from "@/features/library/pages/MusicInfoPage";
import PlaylistInfoPage from "@/features/playlist/pages/PlaylistInfoPage";
import NotFoundPage from "@/features/dashboard/pages/NotFoundPage";
import RequireAuth from "./RequireAuth";
import GuestOnly from "./GuestOnly";

export default function AppRoutes() {
  const location = useLocation();
  const navigate = useNavigate();

  // Google OAuth 로그인은 세션 토큰을 URL 해시(#access_token=...)에 실어 돌아오고,
  // supabase-js가 그 값을 읽은 뒤 `location.hash = ''`로 지우는데 이때 빈 "#"만
  // 주소에 남습니다. window.history를 직접 건드려 지우면 React Router가 그 변경을
  // 몰라서 예전 해시를 계속 기억하다 다음 네비게이션 때 다시 붙여버리므로, 이 앱에서
  // 유일하게 해시를 쓰는 이 자리(라우팅 최상단)에서 React Router 자신의 navigate로
  // 지워야 실제 주소와 내부 캐시가 같이 갱신됩니다. 이 앱은 해시를 다른 용도로 쓰지
  // 않으므로 남아있는 해시는 전부 이 찌꺼기로 간주합니다.
  useEffect(() => {
    if (location.hash) {
      navigate(location.pathname + location.search, { replace: true });
    }
  }, [location.hash, location.pathname, location.search, navigate]);

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <GuestOnly>
            <LoginPage />
          </GuestOnly>
        }
      />
      <Route
        path="/signup"
        element={
          <GuestOnly>
            <SignupPage />
          </GuestOnly>
        }
      />
      <Route
        path="/"
        element={
          <RequireAuth>
            <HomeLayout />
          </RequireAuth>
        }
      >
        <Route index element={<LibraryPage />} />
        <Route path="explore" element={<ExplorePage />} />
        <Route path="music/:musicId" element={<MusicInfoPage />} />
        <Route path="playlist/:playlistId" element={<PlaylistInfoPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
