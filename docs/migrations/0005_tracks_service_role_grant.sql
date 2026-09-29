-- YouTube 데이터 갱신 cron(api/cron/refresh-youtube-data.ts)이 tracks에 접근할 수 있게
-- service_role에 권한을 줍니다.
-- 적용: Supabase 대시보드 SQL Editor에 붙여넣어 실행하세요(0001~0004와 같은 방식).
-- 권한만 바뀌므로 database.types.ts 재생성은 필요 없습니다.
--
-- secret key(service_role)는 RLS는 우회하지만 테이블 GRANT는 따로 받아야 합니다. 이
-- 프로젝트는 "Automatically expose new tables"를 꺼 둬서 0001_init.sql이 authenticated
-- 에게만 권한을 줬고, 그래서 cron이 "permission denied for table tracks"로 실패했습니다.
-- cron은 갱신 대상의 video_id를 읽고(select), refresh_youtube_tracks 함수로 갱신만
-- (update) 하므로 그 두 권한만 줍니다(함수는 security invoker라 호출한 service_role의
-- 권한으로 update합니다).

grant select, update on tracks to service_role;
