# DB 스키마

`docs/migrations/0001_init.sql`이 스키마의 소스 오브 트루스입니다.

## 테이블

- `tracks`
- `playlists`
- `playlist_tracks` — `playlists`와 `tracks`를 잇는 join 테이블. 재생목록 row 자체에 순서
  배열을 두는 대신 `position` 컬럼을 두는 방식으로 설계했습니다 — dnd-kit으로 재정렬할 때
  변경된 항목들의 `position`만 batch update하는 로직과 짝을 이룹니다.

## 인덱스

- `tracks.artist`, `tracks.tags`: GIN 인덱스가 걸린 Postgres 배열 컬럼
- `tracks.title`: 부분 검색을 위한 trigram 인덱스(`pg_trgm`)

이 인덱스 구조는 old-src가 IndexedDB의 수동 `multiEntry` 인덱스와 커서 기반 검색 루프로
하던 일을 Postgres 쪽 기능으로 대체한 것입니다.

## Row Level Security

모든 테이블의 정책이 `auth.uid() = user_id`로 행을 제한합니다(`playlist_tracks`는 소유
`playlist`의 `user_id`를 확인하는 `EXISTS` 절). 새 테이블이나 쿼리를 추가할 때 대응하는 RLS
정책이 없으면 **에러 없이 그냥 0건이 반환되니** 데이터가 안 보이면 먼저 RLS 정책부터
의심하세요.

## 타입

`src/lib/database.types.ts`는 현재 이 마이그레이션에 맞춰 손으로 작성되어 있습니다. 스키마를
바꾸면 이 파일을 손으로 고치지 말고 `supabase gen types typescript --linked`로
재생성하세요(파일 상단 코멘트 참고).

## 마이그레이션 운영 방식

이 SQL은 Supabase CLI가 기본으로 인식하는 `supabase/migrations/` 위치가 아니라
`docs/migrations/`에 있습니다. 그래서 `supabase db push` 같은 CLI 마이그레이션 명령은 이
파일을 자동으로 집어가지 못하고, 지금은 Supabase 대시보드 SQL Editor에 수동으로 붙여넣는
워크플로를 전제로 합니다.
