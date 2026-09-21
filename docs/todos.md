# TODO

아직 진행 전인, 나중에 처리하기로 한 작업 목록입니다. 처리하면 목록에서 지우세요.

- [ ] **`MusicInfoPage` 수정 폼**: 조회/재생/삭제는 구현했지만 제목·아티스트·태그를 고치는
      폼(react-hook-form + zod 추천)은 아직 없다.
- [ ] **비로그인 사용자에게 검색+재생 허용 검토**: 현재는 `/login`, `/signup`을 제외한 모든
      라우트가 `RequireAuth`로 보호되어 있다(`src/router/AppRoutes.tsx`). 게스트에게
      검색+재생 정도를 열어줄지 결정하고, 그렇게 하면 해당 라우트를 `RequireAuth` 밖으로
      옮긴다.
