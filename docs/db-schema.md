# DB 스키마

`docs/migrations/0001_init.sql`, `docs/migrations/0002_user_settings.sql`,
`docs/migrations/0003_user_settings_drop_updated_at.sql`,
`docs/migrations/0004_tracks_youtube_refresh.sql`,
`docs/migrations/0005_tracks_service_role_grant.sql`이 스키마의 소스 오브 트루스입니다.

## 테이블

- `tracks` — `title`/`artist`/`tags`는 사용자가 입력한 값이고, YouTube Data API에서 받아
  저장하는 값은 `duration`(과 `video_id`)뿐입니다. `duration_synced_at`/`unavailable_at`은
  아래 "YouTube API 데이터 30일 갱신" 참고.
- `playlists`
- `playlist_tracks` — `playlists`와 `tracks`를 잇는 join 테이블. 재생목록 row 자체에 순서
  배열을 두는 대신 `position` 컬럼을 두는 방식으로 설계했습니다 — dnd-kit으로 재정렬하면
  새 순서 전체를 `position`(0부터)으로 한 번에 upsert합니다(`reorderPlaylistTracks`). 곡을
  빼도 빈 자리를 다시 매기지 않으므로, 곡을 추가할 땐 개수가 아니라 "현재 최대
  `position` + 1"부터 붙입니다(`addTracksToPlaylist`).
- `user_settings` — 사용자별 화면 테마(`theme`: `'light' | 'dark'`, 기본값 `'light'`) 하나만
  들어있는 1행 테이블. 새 사용자는 row가 없을 수 있어(첫 테마 변경 전) 읽을 때 없으면
  기본값으로 취급하고, 쓸 때는 upsert합니다. 로그인 화면·랜딩 페이지 같은 비로그인 화면은
  이 값과 무관하게 항상 라이트를 씁니다(HomeLayout 하위 인증 영역에서만 적용).

## 인덱스

- `tracks.artist`, `tracks.tags`: GIN 인덱스가 걸린 Postgres 배열 컬럼
- `tracks.title`: 부분 검색을 위한 trigram 인덱스(`pg_trgm`)

이 인덱스 구조는 old-src가 IndexedDB의 수동 `multiEntry` 인덱스와 커서 기반 검색 루프로
하던 일을 Postgres 쪽 기능으로 대체하려고 만든 것입니다. 다만 지금 화면의 라이브러리
검색(라이브러리 화면, 헤더 검색 결과)은 사용자의 곡 전체를 불러온 뒤 브라우저에서
거르기 때문에 이 인덱스를 쓰지 않습니다 — 서버 쪽 검색으로 바꿀 때 씁니다.

## Row Level Security

모든 테이블의 정책이 `auth.uid() = user_id`로 행을 제한합니다(`playlist_tracks`는 소유
`playlist`의 `user_id`를 확인하는 `EXISTS` 절). 새 테이블이나 쿼리를 추가할 때 대응하는 RLS
정책이 없으면 **에러 없이 그냥 0건이 반환되니** 데이터가 안 보이면 먼저 RLS 정책부터
의심하세요.

## YouTube API 데이터 30일 갱신

YouTube API Developer Policies III.E.4.d에 따르면 사용자 OAuth 동의 없이 가져온 공개
데이터(Non-Authorized Data)는 30일을 넘겨 저장할 수 없고, 30일이 지나면 **삭제하거나
다시 조회해 갱신(refresh)해야** 합니다 — 이 앱은 갱신 쪽을 택했습니다(갱신하면 그
시점부터 30일이 다시 시작). III.E.4.e는 이와 별개로 저장한 데이터를 YouTube의 현재
데이터와 일치하도록 "reasonable efforts"를 하라고 요구합니다. ("30일마다 영상 삭제 여부
검증" 조항인 III.E.4.b는 조회수 같은 통계를 30일 넘게 보관하는 경우의 조건이라
`duration`에는 직접 해당하지 않습니다.)

- `api/cron/refresh-youtube-data.ts`를 `vercel.json`의 `crons`가 매일 03:00(KST) 무렵
  호출합니다. `duration_synced_at`이 25일 넘게 지난 곡(Hobby 플랜 cron의 실행 시각 오차와
  하루 이틀 실패에 대비한 여유)과 재생 불가 곡을 모아 `videos.list`(50개씩)로 다시
  조회합니다. 같은 영상을 여러 사용자가 담아둘 수 있어 video_id 기준으로 중복을 없애고
  반영합니다.
- 반영은 `refresh_youtube_tracks(refreshed jsonb, missing text[])` 함수가 합니다. 응답에
  있던 영상은 `duration`을 새 값으로, 응답에서 빠진 영상(삭제·비공개 전환)은 정책상
  갱신할 수 없는 `duration`을 `null`로 비우고 `unavailable_at`을 채웁니다(그래서
  `duration`은 nullable — `unavailable_at`이 있으면 `duration`은 항상 `null`). 곡 row와
  사용자가 입력한 값·재생목록 소속은 그대로 두고, 영상이 다시 공개되면 다음 실행 때
  복구합니다. RLS를 우회해야 해서 이 함수는 `service_role`(서버 전용 `SUPABASE_SECRET_KEY`)
  만 실행할 수 있습니다. `service_role`은 RLS는 우회하지만 테이블 GRANT는 따로 필요해서,
  `tracks`에 `select`/`update`만 줬습니다(0005) — 새 서버 전용 작업이 다른 테이블에
  접근해야 하면 같은 식으로 GRANT를 추가해야 하고, 없으면 "permission denied"가 납니다.
- 화면에선 재생 불가 곡의 재생시간 자리에 "재생 불가"를 보여주고 재생 버튼을 막으며,
  큐를 순서대로 재생할 때(곡이 끝나 자동으로 넘어갈 때와 이전/다음 곡 버튼) 건너뜁니다
  (`features/library/lib/tracks.ts`의 `isTrackPlayable`,
  `features/player/lib/queue-navigation.ts`).
- YouTube 할당량 초과 등으로 `videos.list`가 실패하면 그 자리에서 멈춥니다 — 실패
  응답을 "영상 없음"으로 해석해 멀쩡한 곡을 재생 불가로 만들지 않기 위해서입니다. 처리
  못 한 곡은 다음 실행 때 다시 대상이 됩니다.

## 타입

`src/shared/lib/database.types.ts`는 `supabase login` + `supabase link --project-ref <ref>`로
프로젝트를 연결한 뒤 `supabase gen types typescript --linked`로 생성한 파일입니다. 스키마를
바꾸면(`docs/migrations/`에 SQL 추가 후 적용 — 아래 "마이그레이션 운영 방식") 이 파일을
손으로 고치지 말고 같은 명령을 다시 실행해 덮어쓰세요. 손으로 고치면 안 되는 이유: 이 SDK(`@supabase/supabase-js`,
내부적으로 `postgrest-js`)는 `Database` 타입이 `Relationships`/`Views`/`Functions`/
`Enums`/`CompositeTypes` 등 특정 형태를 갖추고 있다고 가정하는데, 이 필드가 빠지면
`supabase.from(...).insert(...)` 같은 호출이 타입 에러 없이 조용히 `never`로 무너집니다
(실제로 겪은 문제입니다 — 처음 스캐폴딩 때 손으로 쓴 버전이 정확히 이렇게 깨졌습니다).

## 마이그레이션 운영 방식

이 SQL은 Supabase CLI가 기본으로 인식하는 `supabase/migrations/` 위치가 아니라
`docs/migrations/`에 있습니다. 그래서 `supabase db push` 같은 CLI 마이그레이션 명령은 이
파일을 자동으로 집어가지 못하고, 새 파일을 하나씩 직접 적용합니다:

1. `npx supabase db query --linked -f docs/migrations/<파일>.sql` — 연결된 프로젝트에
   적용합니다(Management API를 거쳐서 DB 비밀번호가 필요 없음). 이 저장소는 이미
   `supabase link`로 연결되어 있습니다(`supabase/.temp/project-ref`, git에는 안 올라감).
   CLI를 쓸 수 없으면 Supabase 대시보드 SQL Editor에 그대로 붙여넣어 실행해도 됩니다.
2. `npx supabase gen types typescript --linked > src/shared/lib/database.types.ts`로 타입을
   다시 생성하고 `npm run build`로 확인합니다.

연결된 DB가 배포된 앱이 실제로 쓰는 DB라, 적용 전에 무엇이 바뀌는지 확인하고 실행하세요.
