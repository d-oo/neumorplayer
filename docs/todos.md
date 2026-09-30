# TODO

아직 진행 전인, 나중에 처리하기로 한 작업 목록입니다. 처리하면 목록에서 지우세요.

- [ ] **`MusicInfoPage`/`PlaylistInfoPage` 수정 폼**: 조회/재생/삭제는 구현했지만 제목·
      아티스트·태그(또는 재생목록 제목)를 고치는 폼(react-hook-form + zod 추천)은 아직
      없다. docs/design/수정본2.zip 반영으로 두 화면 모두에 "수정" 원형 버튼이 생겼지만
      `onClick`이 비어있는 자리 표시자다 — 실제 폼을 만들면 여기에 연결한다.
- [ ] **검색 결과 탭 기억하기(뒤로가기 정책 정립 후)**: 헤더 검색 결과 화면
      ([SearchResultsView.tsx](src/features/library/components/SearchResultsView.tsx))의
      제목/아티스트/태그 탭은 지금 컴포넌트 상태라, 곡을 눌러 정보 페이지로 갔다가
      뒤로 오면 항상 "제목" 탭으로 돌아간다. 보고 있던 탭으로 돌아오게 하고 싶지만, 앱
      전체의 뒤로가기 동작을 아직 정하지 않아서 보류했다 — 그걸 정한 뒤 탭을 URL(예:
      `?q=`와 나란히 `?tab=`)에 두는 식으로 구현한다. 새로 검색하거나 검색어를 바꿔 다시
      검색하면 "제목"으로 돌아가는 지금 규칙은 유지해야 한다.
- [ ] **포지셔닝 조정("대체 서비스" 리스크 축소)**: 랜딩 문구 수정 —
      [LandingFeatureCards.tsx](src/features/landing/components/LandingFeatureCards.tsx)의
      "YouTube 전곡 연결"과 "고른 카드가 곧바로 재생됩니다",
      [LandingHero.tsx](src/features/landing/components/LandingHero.tsx) 본문의 "음악을
      다룹니다 … 그 자리에서 재생합니다"처럼 YouTube 콘텐츠를 음악 재생 서비스로 내세우는
      표현을 빼고, 태그 분류·직접 붙이는 제목/아티스트 같은 라이브러리 정리 기능을
      앞세운다. 문구가 바뀌는 디자인 변경이라 승인을 받고 진행한다.
- [ ] **"Developed with YouTube" 배지 위치 수정(YouTube API 정책 위반 대응)**: 지금은
      `AuthLayout.tsx`(로그인/회원가입 화면)에만 배지가 있는데, 정작 그 화면엔 YouTube
      콘텐츠가 안 나온다. Branding Guidelines는 "YouTube API가 존재하는 모든 페이지"마다
      배지를 요구하므로, `ExplorePage`(검색 결과)·`LibraryPage`/`PlaylistInfoPage`(썸네일
      목록)·`MusicInfoPage`·`PlayerPanel`처럼 실제 YouTube 콘텐츠가 나오는 화면에도
      있어야 한다 — 로그인 이후 전체 라우트에 공통으로 떠 있는 `HomeLayout`(사이드바/푸터)에
      한 번 박아두면 이 화면들을 한꺼번에 커버할 수 있다. 추가로 지금 배지는 `<img>`
      태그뿐이라 클릭이 안 되는데, 가이드라인이 "로고는 클릭 가능해야 하고 YouTube
      콘텐츠나 YouTube 관련 컴포넌트로 링크되어야 한다"고 요구하므로 `<a>`로 감싸야 한다.
      정확한 최소 크기/여백(clear space) 수치는 brand.youtube 사이트에 별도로 있으니
      적용 전에 확인한다.
- [ ] **회원가입을 초대제로 전환("대체 서비스" 리스크 축소)**: Supabase 대시보드
      Authentication → Settings에서 "Enable sign ups"를 끄고, 본인이 대시보드의
      "Invite user" 또는 `supabase.auth.admin.inviteUserByEmail()`(service role key,
      서버 전용)로 원하는 사람만 초대하는 방식으로 바꾼다. 코드 쪽은 `/signup` 라우트와
      `SignupPage` UI를 지우거나 숨기는 정도면 된다(백엔드에서 막혀도 UI가 남아있으면
      사용자가 헷갈림). 진짜 "신청 → 검토 → 승인" 워크플로가 아니라 "본인이 미리 정해서
      초대"하는 방식이라는 점은 감안한다.
- [ ] **개인정보 처리방침/이용약관 페이지 신설(YouTube API 정책 위반 대응)**: 지금
      `SignupPage`의 동의 체크박스("서비스 이용약관과 개인정보 처리방침에 동의합니다",
      [AuthForm.tsx](src/features/auth/components/AuthForm.tsx)의 `AgreeCheckbox`)가
      가리키는 두 문서가 실제로는 어디에도 없다 — 링크도, 라우트도 없음. YouTube API
      Developer Policies III.A는 (1) 사용자가 접근하기 전에 동의를 요구하는 개인정보
      처리방침이 항상 눈에 띄게 접근 가능해야 하고, (2) 이 앱이 YouTube API Services를
      쓴다는 사실과 어떤 사용자 정보(API Data 포함)를 수집·저장·사용하는지를 명확히
      설명해야 하며, (3) YouTube 자체 ToS(https://www.youtube.com/t/terms) 링크를
      표시하고 자체 이용약관에 "이 앱을 쓰면 YouTube ToS에도 동의하는 것"이라고 명시할
      것을 요구한다. `/privacy`, `/terms` 같은 공개 라우트(GuestOnly/RequireAuth 밖)를
      새로 만들고 체크박스에서 실제로 링크되게 고친다. 개인정보 처리방침 쪽 본문은
      랜딩 페이지 배너("자세히 보기")가 띄우는
      [PrivacyPolicyModal.tsx](src/features/landing/components/PrivacyPolicyModal.tsx)에
      이미 작성해뒀으니, 라우트를 만들 땐 이 본문을 옮기고 모달은 그 라우트로 링크만
      하도록 바꾼다(이용약관 본문은 아직 없음 — 같이 작성 필요).
