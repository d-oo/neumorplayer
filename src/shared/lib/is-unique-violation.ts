// Supabase(Postgres)가 unique 제약 위반(코드 23505)으로 거절한 오류인지. 같은 곡을
// 라이브러리에 두 번 추가하거나(tracks의 user_id, video_id) 같은 이름의 재생목록을
// 만들 때(playlists의 user_id, title) DB가 막아주는 경우라, 호출부는 이걸로 판별해
// 사용자가 이해할 수 있는 문구를 따로 보여줍니다.
export function isUniqueViolation(error: unknown): boolean {
  return (error as { code?: string } | null)?.code === "23505";
}
