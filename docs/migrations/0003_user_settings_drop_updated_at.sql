-- user_settings.updated_at 제거: 코드 어디에서도 읽지 않고(테마 조회는 theme
-- 컬럼만 select), 매 upsert 때 클라이언트가 값만 채워 넣을 뿐 활용하는 로직이
-- 없었습니다. 다른 테이블(tracks, playlists)도 created_at만 두고 updated_at은
-- 쓰지 않아 스키마 전체 패턴과도 맞지 않았습니다.
-- 적용: Supabase 대시보드 SQL Editor에 붙여넣어 실행하세요(0001/0002와 같은 방식).
-- 적용 후 `supabase gen types typescript --linked`로 src/shared/lib/database.types.ts를
-- 다시 생성하세요.

alter table user_settings drop column updated_at;
