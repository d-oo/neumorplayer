import { BrowserRouter, Routes, Route } from "react-router-dom";
import RequireAuth from "@/features/auth/RequireAuth";
import HomeLayout from "@/routes/HomeLayout";
import SearchPage from "@/routes/SearchPage";
import MusicInfoPage from "@/routes/MusicInfoPage";
import PlaylistInfoPage from "@/routes/PlaylistInfoPage";
import NotFoundPage from "@/routes/NotFoundPage";

export default function App() {
  return (
    <BrowserRouter>
      <RequireAuth>
        <Routes>
          <Route path="/" element={<HomeLayout />}>
            <Route index element={<SearchPage />} />
            <Route path="music/:musicId" element={<MusicInfoPage />} />
            <Route path="playlist/:playlistId" element={<PlaylistInfoPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </RequireAuth>
    </BrowserRouter>
  );
}
