import { BrowserRouter, Routes, Route } from "react-router-dom";
import RequireAuth from "@/features/auth/RequireAuth";
import GuestOnly from "@/features/auth/GuestOnly";
import LoginPage from "@/features/auth/LoginPage";
import SignupPage from "@/features/auth/SignupPage";
import HomeLayout from "@/routes/HomeLayout";
import SearchPage from "@/routes/SearchPage";
import ExplorePage from "@/routes/ExplorePage";
import MusicInfoPage from "@/routes/MusicInfoPage";
import PlaylistInfoPage from "@/routes/PlaylistInfoPage";
import NotFoundPage from "@/routes/NotFoundPage";

export default function App() {
  return (
    <BrowserRouter>
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
          <Route index element={<SearchPage />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="music/:musicId" element={<MusicInfoPage />} />
          <Route path="playlist/:playlistId" element={<PlaylistInfoPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
