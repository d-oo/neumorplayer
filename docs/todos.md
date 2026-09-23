# TODO

아직 진행 전인, 나중에 처리하기로 한 작업 목록입니다. 처리하면 목록에서 지우세요.

- [ ] **`MusicInfoPage`/`PlaylistInfoPage` 수정 폼**: 조회/재생/삭제는 구현했지만 제목·
      아티스트·태그(또는 재생목록 제목)를 고치는 폼(react-hook-form + zod 추천)은 아직
      없다. docs/design/수정본2.zip 반영으로 두 화면 모두에 "수정" 원형 버튼이 생겼지만
      `onClick`이 비어있는 자리 표시자다 — 실제 폼을 만들면 여기에 연결한다.
- [ ] **YouTube API 데이터 30일 갱신 배치 작업**: `tracks.duration`은 YouTube Data API에서
      가져온 값을 만료·재조회 로직 없이 영구 저장 중이다(Developer Policies — API 데이터는
      30일 넘게 저장할 수 없고 최신 상태로 유지해야 한다는 조항, 그리고 30일마다 영상이
      삭제되지 않았는지 검증할 것을 요구하는 조항 모두 해당). Vercel Cron Job으로 하루 1회
      도는 서버리스 함수(`api/cron/...`)를 새로 만들어 `duration_synced_at`(신설 컬럼)이
      30일 지난 트랙을 골라 `videos.list`(최대 50개씩 배치)로 `duration`을 다시 조회·
      갱신하고, 응답에 항목이 빠져 있으면(영상 삭제/비공개 전환) 그 트랙을 사용자에게 어떻게
      보여줄지도 함께 정해야 한다. 여러 사용자의 `tracks`를 한꺼번에 다뤄야 해서 RLS를
      우회하는 service role key를 서버 전용으로 새로 들여와야 한다(클라이언트 노출 금지).
- [ ] **"YouTube 대체 서비스" 금지 조항 검토**: YouTube API Developer Policies는 YouTube의
      핵심 사용자 경험을 대체하거나 상당히 유사한 서비스를 만드는 것을 금지하고,
      "significant independent value or functionality"를 추가하는 경우만 예외로 둔다.
      이 앱의 탐색→라이브러리→재생목록→재생 흐름은 YouTube(Music)의 핵심 흐름과 매우
      유사해서 코드 한 곳을 고쳐서 해결되는 문제가 아니라 제품 방향 판단이 필요하다 —
      지금의 뉴모피즘 UI·개인 태그 분류 같은 것이 "독립적 가치"로 인정될지는 불확실하니,
      진지하게 서비스를 키울 계획이라면 한 번 짚고 넘어가야 한다.
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
- [ ] **재생을 직접 트리거하는 썸네일이 최소 크기(120×70px) 미달(YouTube API 정책 위반
      대응)**: Required Minimum Functionality는 "재생을 시작시키는 YouTube 썸네일은
      최소 120×70px이어야 한다"고 요구하는데, [ThumbBox.tsx](src/shared/components/ThumbBox.tsx#L7-L11)의
      `queue`(56×32px)·`row`(60×34px) 크기가 둘 다 미달이다. 이 크기가 클릭 시 곧바로
      재생을 트리거하는 자리 — `QueueCard.tsx`의 "재생 트랙" 목록 행(105-116줄,
      `jumpTo()` 호출)과 `PlaylistInfoPage.tsx`의 `SortableTrackRow`(130-135줄,
      `onPlay` → `playQueue()`) — 에서 썸네일을 키우거나, 재생 트리거를 썸네일이 아닌
      별도 작은 아이콘 버튼으로 분리해야 한다(`LibraryPage.tsx`의 같은 크기 `row`
      썸네일은 클릭 시 재생이 아니라 상세 페이지로 이동만 하므로 이 규칙 대상이 아님 —
      그대로 둬도 됨).
