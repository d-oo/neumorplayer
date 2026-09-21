import { supabase } from "@/shared/lib/supabase";
import type { Database } from "@/shared/lib/database.types";
import type { Track } from "@/features/library/lib/tracks";

export type Playlist = Database["public"]["Tables"]["playlists"]["Row"];
export interface PlaylistWithCount extends Playlist {
  trackCount: number;
  // position순 앞 4곡의 video_id — PlaylistCoverGrid의 2x2 콜라주용. 4곡보다 적으면
  // 그만큼만 채워지고, 트랙이 하나도 없으면 빈 배열입니다.
  coverVideoIds: string[];
}

const COVER_TRACK_LIMIT = 4;

// tracks.ts와 같은 이유로 user?.id는 쿼리 키 구분에만 씁니다 — 실제 접근 제어는
// playlists/playlist_tracks의 RLS(EXISTS로 소유 playlist 확인)가 담당합니다.
export function playlistsQueryKey(userId: string | undefined) {
  return ["playlists", userId] as const;
}

export function playlistQueryKey(playlistId: string | undefined) {
  return ["playlist", playlistId] as const;
}

export function playlistTracksQueryKey(playlistId: string | undefined) {
  return ["playlist-tracks", playlistId] as const;
}

// AddToPlaylistButton(현재 곡이 어느 재생목록에 이미 들어있는지)이 씁니다.
export function playlistMembershipQueryKey(trackId: string | undefined) {
  return ["playlist-membership", trackId] as const;
}

// QueueCard의 "재생목록" 탭 + 재생목록 추가 드롭다운(AddToPlaylistButton) + 커버
// 콜라주가 공유하는 목록 조회. playlist_tracks(count)는 PostgREST의 임베디드 카운트
// 문법으로, 각 행마다 [{ count: N }] 형태로 내려옵니다.
// 커버용 video_id는 재생목록마다 따로 쿼리하면 N+1이 되므로, 이 화면에 보이는
// 재생목록들의 playlist_tracks를 한 번에 가져온 뒤 자바스크립트에서 playlist_id별로
// 앞 4개만 추려냅니다(총 쿼리 2번, 재생목록 개수와 무관).
export async function fetchPlaylists(): Promise<PlaylistWithCount[]> {
  const { data: playlists, error } = await supabase
    .from("playlists")
    .select("*, playlist_tracks(count)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  if (playlists.length === 0) return [];

  const { data: coverRows, error: coverError } = await supabase
    .from("playlist_tracks")
    .select("playlist_id, tracks(video_id)")
    .in(
      "playlist_id",
      playlists.map((p) => p.id),
    )
    .order("position", { ascending: true });
  if (coverError) throw coverError;

  const coverByPlaylist = new Map<string, string[]>();
  for (const row of coverRows) {
    if (!row.tracks) continue;
    const ids = coverByPlaylist.get(row.playlist_id) ?? [];
    if (ids.length < COVER_TRACK_LIMIT) ids.push(row.tracks.video_id);
    coverByPlaylist.set(row.playlist_id, ids);
  }

  return playlists.map(({ playlist_tracks, ...playlist }) => ({
    ...playlist,
    trackCount: playlist_tracks[0]?.count ?? 0,
    coverVideoIds: coverByPlaylist.get(playlist.id) ?? [],
  }));
}

export async function fetchPlaylist(playlistId: string): Promise<Playlist> {
  const { data, error } = await supabase
    .from("playlists")
    .select("*")
    .eq("id", playlistId)
    .single();
  if (error) throw error;
  return data;
}

// position 순으로 정렬된 트랙 목록. playlist_tracks.track_id -> tracks.id는
// 다대일이라 tracks(*)는 배열이 아니라 단건 객체로 내려옵니다.
export async function fetchPlaylistTracks(
  playlistId: string,
): Promise<Track[]> {
  const { data, error } = await supabase
    .from("playlist_tracks")
    .select("tracks(*)")
    .eq("playlist_id", playlistId)
    .order("position", { ascending: true });
  if (error) throw error;
  return data
    .map((row) => row.tracks)
    .filter((t): t is Track => t !== null);
}

export async function fetchPlaylistIdsForTrack(
  trackId: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("playlist_tracks")
    .select("playlist_id")
    .eq("track_id", trackId);
  if (error) throw error;
  return data.map((row) => row.playlist_id);
}

export async function createPlaylist(
  userId: string,
  title: string,
): Promise<Playlist> {
  const { data, error } = await supabase
    .from("playlists")
    .insert({ user_id: userId, title })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletePlaylist(playlistId: string): Promise<void> {
  const { error } = await supabase
    .from("playlists")
    .delete()
    .eq("id", playlistId);
  if (error) throw error;
}

// 새로 추가되는 트랙은 항상 맨 뒤에 붙습니다(현재 트랙 개수를 다음 position으로 사용).
export async function addTrackToPlaylist(
  playlistId: string,
  trackId: string,
): Promise<void> {
  const { count, error: countError } = await supabase
    .from("playlist_tracks")
    .select("*", { count: "exact", head: true })
    .eq("playlist_id", playlistId);
  if (countError) throw countError;
  const { error } = await supabase
    .from("playlist_tracks")
    .insert({ playlist_id: playlistId, track_id: trackId, position: count ?? 0 });
  if (error) throw error;
}

export async function removeTrackFromPlaylist(
  playlistId: string,
  trackId: string,
): Promise<void> {
  const { error } = await supabase
    .from("playlist_tracks")
    .delete()
    .eq("playlist_id", playlistId)
    .eq("track_id", trackId);
  if (error) throw error;
}

// dnd-kit 드래그 종료 후 새 순서 전체를 position(0부터)으로 다시 씁니다. 복합
// PK(playlist_id, track_id)에 대한 upsert라 기존 행의 position만 갱신됩니다.
export async function reorderPlaylistTracks(
  playlistId: string,
  orderedTrackIds: string[],
): Promise<void> {
  const rows = orderedTrackIds.map((trackId, index) => ({
    playlist_id: playlistId,
    track_id: trackId,
    position: index,
  }));
  const { error } = await supabase
    .from("playlist_tracks")
    .upsert(rows, { onConflict: "playlist_id,track_id" });
  if (error) throw error;
}
