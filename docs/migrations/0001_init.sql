-- neumorplayer 초기 스키마
-- old-src의 IndexedDB object store(music/playlist)를 정규화된 관계형 테이블로 옮긴 버전입니다.
-- 적용: Supabase 대시보드 SQL Editor에 붙여넣어 실행하세요.
--
-- 참고: 이 파일은 원래 `supabase/migrations/`(Supabase CLI가 인식하는 표준 위치)에 있었는데
-- 문서 정리를 위해 docs/migrations/로 옮겼습니다. 즉 `supabase db push` 같은 CLI 명령은 이 파일을
-- 자동으로 인식하지 못합니다 — CLI 기반 마이그레이션 관리를 쓰고 싶어지면 다시
-- `supabase/migrations/`로 되돌리거나 `supabase link` 후 이 SQL을 그 구조로 옮기세요.

create extension if not exists pg_trgm;

create table if not exists tracks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  artist text[] not null default '{}',
  video_id text not null,
  tags text[] not null default '{}', -- 장르/무드/형태 등 분류는 전부 여기로 (예: '발라드','OST','공부용')
  duration int not null check (duration >= 0),
  play_count int not null default 0,
  recent_play timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, video_id)
);

create table if not exists playlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now(),
  unique (user_id, title)
);

create table if not exists playlist_tracks (
  playlist_id uuid not null references playlists(id) on delete cascade,
  track_id uuid not null references tracks(id) on delete cascade,
  position int not null,
  primary key (playlist_id, track_id)
);

-- 검색/정렬 성능용 인덱스
create index if not exists tracks_artist_gin on tracks using gin (artist);
create index if not exists tracks_tags_gin on tracks using gin (tags);
create index if not exists tracks_title_trgm on tracks using gin (title gin_trgm_ops);
create index if not exists tracks_recent_add_idx on tracks (user_id, created_at desc);
create index if not exists tracks_recent_play_idx on tracks (user_id, recent_play desc);
create index if not exists tracks_most_play_idx on tracks (user_id, play_count desc);
create index if not exists playlist_tracks_playlist_idx on playlist_tracks (playlist_id, position);

-- RLS: 각자 자기 데이터만 읽고 쓸 수 있습니다.
alter table tracks enable row level security;
alter table playlists enable row level security;
alter table playlist_tracks enable row level security;

create policy "own tracks" on tracks
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "own playlists" on playlists
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "own playlist_tracks" on playlist_tracks
  for all
  using (
    exists (
      select 1 from playlists p
      where p.id = playlist_tracks.playlist_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from playlists p
      where p.id = playlist_tracks.playlist_id and p.user_id = auth.uid()
    )
  );

-- Data API(PostgREST)가 이 테이블들을 다룰 수 있도록 명시적으로 권한을 부여합니다.
-- 프로젝트 생성 시 "Automatically expose new tables"를 껐다면 이 GRANT가 없으면
-- RLS 정책과 무관하게 "permission denied"가 발생합니다. 이 앱은 로그인 필수라
-- anon(비로그인) 롤에는 아무 권한도 주지 않고 authenticated 롤에만 부여합니다.
grant select, insert, update, delete on tracks, playlists, playlist_tracks to authenticated;
