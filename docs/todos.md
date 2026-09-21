# TODO

아직 진행 전인, 나중에 처리하기로 한 작업 목록입니다. 처리하면 목록에서 지우세요.

- [ ] **`MusicInfoPage`/`PlaylistInfoPage` 수정 폼**: 조회/재생/삭제는 구현했지만 제목·
      아티스트·태그(또는 재생목록 제목)를 고치는 폼(react-hook-form + zod 추천)은 아직
      없다. docs/design/수정본2.zip 반영으로 두 화면 모두에 "수정" 원형 버튼이 생겼지만
      `onClick`이 비어있는 자리 표시자다 — 실제 폼을 만들면 여기에 연결한다.
- [ ] **비로그인 사용자에게 검색+재생 허용 검토**: 현재는 `/login`, `/signup`을 제외한 모든
      라우트가 `RequireAuth`로 보호되어 있다(`src/router/AppRoutes.tsx`). 게스트에게
      검색+재생 정도를 열어줄지 결정하고, 그렇게 하면 해당 라우트를 `RequireAuth` 밖으로
      옮긴다.
- [ ] **프로필 드롭다운의 "설정" 메뉴**(`src/features/auth/components/ProfileDropdown.tsx`):
      아직 이동할 라우트/화면이 없어 시각적 표시(아이콘+hover)만 있고 `onClick`은 없다.
      실제 설정 화면을 만들면 이 항목에 라우트를 연결한다.
