# TODO

아직 진행 전인, 나중에 처리하기로 한 작업 목록입니다. 처리하면 목록에서 지우세요.

- [ ] **YouTube API 키의 "HTTP 리퍼러" 제한을 풀어야 함(막힘, 확인 필요)**: `.env.local`의
      `YOUTUBE_API_KEY`가 Google Cloud Console에서 "HTTP 리퍼러" 애플리케이션 제한으로
      설정돼 있어서, 서버(`api/` 아래 Vercel Functions, 즉 `vercel dev`나 실제 배포)에서
      호출하면 `API_KEY_HTTP_REFERRER_BLOCKED` 403으로 막힌다 — 브라우저에서만 뜨는
      `Referer` 헤더를 서버 요청은 보내지 않기 때문에, 이 제한 방식 자체가 서버 전용 키와
      구조적으로 안 맞는다(referer가 뭐든 상관없이 항상 막힘). Google Cloud Console →
      APIs & Services → Credentials에서 이 키의 Application restrictions를 "None"으로
      바꾸거나(브라우저에 노출 안 되는 서버 전용 키라 안전) API restrictions로 YouTube
      Data API v3만 허용하는 정도로 보완해야 한다. 이 제한을 풀기 전까지는 탐색 화면의
      실제 검색이 로컬(`vercel dev`)과 배포 환경 모두에서 동작하지 않는다.
- [ ] **탐색 화면 "추가" 버튼에서 실제로 tracks 테이블에 insert하기(Supabase 연동)**:
      `src/routes/ExplorePage.tsx`는 YouTube 검색/상세 조회까지는 실제 API로 연동했지만,
      "추가" 버튼은 아직 선택 상태만 초기화할 뿐 Supabase에 저장하지 않는다(사용자 요청으로
      Supabase 연동은 의도적으로 나중으로 미룸). 실제로 라이브러리에 추가되도록
      `tracks` 테이블 insert(및 선택된 태그 반영)를 마저 구현해야 한다.
- [ ] **비로그인 사용자에게 검색+재생 허용 검토**: 현재는 `/login`, `/signup`을 제외한 모든
      라우트가 `RequireAuth`로 보호되어 있다(`src/router/AppRoutes.tsx`). 게스트에게
      검색+재생 정도를 열어줄지 결정하고, 그렇게 하면 해당 라우트를 `RequireAuth` 밖으로
      옮긴다.
- [ ] **`src/` 폴더를 `features`/`shared`/`router` 컨벤션으로 재편**: 컨벤션 자체는 확정됨
      (CLAUDE.md의 "Feature 폴더 컨벤션" 참고). `features/auth/`는 이미 이 컨벤션대로
      정리했고(`pages/`, `components/`, `hooks/`), `RequireAuth`/`GuestOnly`도
      `src/router/`로 옮기고 `App.tsx`의 라우트 트리도 `src/router/AppRoutes.tsx`로
      분리했다. 남은 건: `player`(경계가 이미 명확하니 지금 정리해도 됨)와, `src/routes/`
      아래 아직 뼈대뿐인 페이지들(탐색/검색/재생목록 정보 등 — 이건 실제로 구현하며
      feature 경계가 확정될 때 옮긴다). `shared/`(`src/lib/`, `src/stores/` 통합)도 아직
      안 함.
