-- YouTube API 데이터 30일 갱신(api/cron/refresh-youtube-data.ts)용 컬럼과 함수
-- 적용: Supabase 대시보드 SQL Editor에 붙여넣어 실행하세요(0001~0003과 같은 방식).
-- 적용 후 `supabase gen types typescript --linked`로 src/shared/lib/database.types.ts를
-- 다시 생성하세요.
--
-- YouTube API Developer Policies III.E.4.d: 사용자 OAuth 동의 없이 가져온 공개 데이터
-- (tracks.duration)는 30일을 넘겨 저장할 수 없고, 30일이 지나면 삭제하거나 다시 조회해
-- 갱신해야 합니다. 이 앱은 매일 도는 cron이 오래된 트랙을 videos.list로 다시 조회해
-- 갱신하고, 응답에서 빠진 영상(삭제·비공개 전환)은 duration을 비우고 "재생 불가"로
-- 표시합니다(곡 row와 사용자가 입력한 제목·아티스트·태그·재생목록 소속은 그대로 둠).

-- duration_synced_at: duration을 YouTube에서 마지막으로 받아온(또는 재생 불가를 확인한)
-- 시각. 기존 row는 created_at으로 채워서, 추가된 지 오래된 곡이 첫 cron 실행 때 바로
-- 갱신 대상이 되게 합니다(default now()로 채우면 전부 방금 갱신한 것처럼 보임).
alter table tracks add column if not exists duration_synced_at timestamptz;
update tracks set duration_synced_at = created_at where duration_synced_at is null;
alter table tracks alter column duration_synced_at set default now();
alter table tracks alter column duration_synced_at set not null;

-- unavailable_at: YouTube 응답에서 영상이 빠진 것을 처음 확인한 시각(null = 재생 가능).
-- 영상이 다시 공개되면 cron이 null로 되돌립니다.
alter table tracks add column if not exists unavailable_at timestamptz;

-- 재생 불가 곡은 갱신할 수 없는 duration을 정책상 계속 들고 있을 수 없어서 비웁니다.
-- 기존 check (duration >= 0)은 null을 통과시키므로 그대로 둡니다.
alter table tracks alter column duration drop not null;

-- cron의 "갱신 대상 찾기" 조회용. 사용자 구분 없이 전체 tracks를 훑습니다.
create index if not exists tracks_duration_synced_idx on tracks (duration_synced_at);

-- cron이 videos.list 결과를 한 번에 반영하는 함수. 같은 영상을 여러 사용자가 담아둘 수
-- 있어서 video_id 기준으로 모든 사용자의 row를 함께 갱신합니다.
--   refreshed: [{"video_id": "...", "duration": 123}, ...] — 응답에 있던 영상
--   missing:   응답에서 빠진 video_id 배열 — 재생 불가로 표시
-- RLS를 우회해야 하므로 서버 전용 secret key(service_role)로만 호출할 수 있게 하고,
-- 클라이언트 롤(anon/authenticated)에선 실행 권한을 뺍니다.
create or replace function refresh_youtube_tracks(refreshed jsonb, missing text[])
returns void
language sql
set search_path = public
as $$
  update tracks t
  set duration = r.duration,
      duration_synced_at = now(),
      unavailable_at = null
  from jsonb_to_recordset(refreshed) as r(video_id text, duration int)
  where t.video_id = r.video_id;

  update tracks
  set duration = null,
      duration_synced_at = now(),
      unavailable_at = coalesce(unavailable_at, now())
  where video_id = any(missing);
$$;

revoke execute on function refresh_youtube_tracks(jsonb, text[]) from public, anon, authenticated;
grant execute on function refresh_youtube_tracks(jsonb, text[]) to service_role;
