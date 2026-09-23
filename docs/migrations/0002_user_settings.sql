-- 사용자별 화면 테마(라이트/다크) 설정
-- 적용: Supabase 대시보드 SQL Editor에 붙여넣어 실행하세요(0001_init.sql과 같은 방식).
-- 적용 후 `supabase gen types typescript --linked`로 src/shared/lib/database.types.ts를
-- 다시 생성하세요.

create table if not exists user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text not null default 'light' check (theme in ('light', 'dark')),
  updated_at timestamptz not null default now()
);

alter table user_settings enable row level security;

create policy "own user_settings" on user_settings
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update, delete on user_settings to authenticated;
