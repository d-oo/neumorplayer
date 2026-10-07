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
- [ ] **회원가입을 초대제로 전환("대체 서비스" 리스크 축소)**: Supabase 대시보드
      Authentication → Settings에서 "Enable sign ups"를 끄고, 본인이 대시보드의
      "Invite user" 또는 `supabase.auth.admin.inviteUserByEmail()`(service role key,
      서버 전용)로 원하는 사람만 초대하는 방식으로 바꾼다. 코드 쪽은 `/signup` 라우트와
      `SignupPage` UI를 지우거나 숨기는 정도면 된다(백엔드에서 막혀도 UI가 남아있으면
      사용자가 헷갈림). 진짜 "신청 → 검토 → 승인" 워크플로가 아니라 "본인이 미리 정해서
      초대"하는 방식이라는 점은 감안한다. 초대받은 사람은 회원가입 화면의 동의
      체크박스를 거치지 않으니, 첫 로그인 전에 이용약관·개인정보처리방침 동의를 받는
      자리(예: 로그인 화면의 Google 안내 문구 같은 안내)를 함께 마련해야 한다(YouTube API
      Developer Policies III.A).
- [ ] **라이브러리 "최근 재생" 정렬**: old-src 홈에는 "최근 추가 / 최근 재생 / 최다 재생"
      정렬이 있었는데,
      [LibraryPage.tsx](src/features/library/pages/LibraryPage.tsx)의 `SORT_OPTIONS`에는
      "최근 재생"이 없다. `tracks.recent_play` 컬럼과 `tracks_recent_play_idx` 인덱스는
      이미 있고, [YouTubePlayer.tsx](src/features/player/components/YouTubePlayer.tsx)가
      곡을 재생할 때마다 값을 기록하고 있으니 정렬 옵션만 추가하면 된다. 한 번도 재생하지
      않은 곡(`recent_play`가 null)은 old-src처럼 목록에서 빼거나 맨 뒤로 보내야 하는데,
      둘 중 어느 쪽으로 할지 정해야 한다. 정렬 탭이 늘어나는 디자인 변경이라 승인을 받고
      진행한다.
- [ ] **곡 추가 화면의 아티스트 자동완성**: old-src(`AddMusic.js`)는 아티스트 입력칸에
      쉼표로 구분된 마지막 항목을 입력하는 동안, 라이브러리에 이미 있는 아티스트 중 그
      글자가 들어간 것을 최대 5개 추천했다(마침표·공백 무시, 대소문자 무시, 이미 똑같이 친
      값은 제외). 추천을 누르면 마지막 항목이 그 값으로 바뀌었다. 지금
      [ExplorePage.tsx](src/features/explore/pages/ExplorePage.tsx)의 아티스트 칸은 그냥
      텍스트 입력이다. 같은 아티스트를 표기만 다르게(예: "IU"/"아이유", 띄어쓰기 차이)
      저장하면 헤더 검색 결과의 아티스트 그룹이 갈라지니, 이걸 막는 용도다. 추천 목록이
      새로 생기는 디자인 변경이라 승인을 받고 진행한다.
- [ ] **라이브러리 목록 스크롤 개선(맨 위로 버튼, 스크롤 복원, 20개씩 불러오기)**: old-src
      홈 목록에 있던 세 가지가 지금은 없다.
      1. **맨 위로 버튼**: 목록을 200px 넘게 내리면 ↑ 버튼이 나타나고, 누르면 부드럽게
         맨 위로 스크롤한다. 지금 스크롤되는 영역은
         [HomeLayout.tsx](src/features/dashboard/pages/HomeLayout.tsx)의 `<main>`이다.
         버튼이 새로 생기는 디자인 변경이라 승인을 받고 진행한다.
      2. **스크롤 위치 복원**: 곡을 눌러 정보 페이지로 갔다가 뒤로 오면 보던 위치로
         돌아온다. old-src는 sessionStorage에 scrollTop을 저장했다. 위의 "검색 결과 탭
         기억하기"와 마찬가지로 앱 전체의 뒤로가기 정책을 정한 뒤에 같이 처리한다.
      3. **20개씩 끊어 불러오기("더 보기")**: 지금은
         [tracks.ts](src/features/library/lib/tracks.ts)의 `fetchLibraryTracks`가 곡을
         한 번에 전부 받아오고, 필터·정렬·헤더 검색·탐색 화면 태그 제안이 모두 이
         전체 목록을 클라이언트에서 처리한다. 끊어 불러오려면 정렬·필터·검색을 서버
         쿼리(`.order()`/`.range()`, `useInfiniteQuery`)로 옮기거나, 전체 목록은 그대로
         받아두고 화면에 그리는 행만 20개씩 늘리는 방식 중에서 골라야 한다. 곡 수가 많아져
         실제로 느려질 때 다시 판단한다. 스크롤 복원(2번)을 하려면 불러온 양도 같이
         기억해야 한다(old-src는 sessionStorage `load`).
- [ ] **곡 정보 페이지에 YouTube 원래 영상 제목 표시**: 지금은 사용자가 입력한
      `tracks.title`만 보여주고 YouTube 영상의 원래 제목은 저장하지도 표시하지도 않는다.
      YouTube API Developer Policies Guide("Your API service must reflect a user's
      standard experience on YouTube")에 "video metadata such as thumbnail and title must
      be visible to the viewer and unmodified"라는 문장이 있다. 이 문장은 플레이어 재생
      기능 예시 안에 있어서 목록 화면까지 해당하는지는 해석이 갈리지만, 최소한
      [MusicInfoPage.tsx](src/features/library/pages/MusicInfoPage.tsx)에는 사용자 제목과
      별도로 원래 제목(필요하면 채널명까지)을 띄워둔다. 방법은 둘 중 하나를 고른다.
      1. **저장**: `tracks`에 컬럼을 추가하고, 곡을 추가할 때 검색 결과의 `snippet.title`을
         같이 저장한다. 영상 ID를 직접 입력해 추가하는 경로도 제목을 받아와야 한다. 원래
         제목도 API Data라서 30일 넘게 보관할 수 없으므로,
         [refresh-youtube-data.ts](api/cron/refresh-youtube-data.ts)의 videos.list 요청
         part/fields에 `snippet(title)`을 추가하고 `refresh_youtube_tracks`도 함께
         갱신하게 고쳐야 한다(마이그레이션 + 타입 재생성 + docs/db-schema.md 반영).
      2. **실시간 조회**: 저장하지 않고, 곡 정보 페이지를 열 때 `api/`의 새 함수로
         videos.list를 불러 받아온다. 30일 갱신 부담은 없지만 페이지를 열 때마다 할당량을
         쓰니, TanStack Query 캐시로 같은 곡의 재조회를 막는다.

      표시 요소가 새로 생기는 디자인 변경이라 승인을 받고 진행한다.
- [ ] **곡 정보 페이지 썸네일 → YouTube 영상 링크**: old-src(`MusicInfo.js`)는 곡 정보
      페이지의 썸네일을 누르면 `https://www.youtube.com/watch?v=<video_id>`가 새 탭으로
      열렸다. 지금 [MusicInfoPage.tsx](src/features/library/pages/MusicInfoPage.tsx)의
      `TrackThumbnail`(이 곡이 재생 중이 아닐 때 보이는 썸네일)에는 링크가 없다. YouTube
      정책(Developer Policies, Branding Guidelines, Required Minimum Functionality)을
      확인한 결과, 썸네일 링크는 필수도 금지도 아니다. 링크가 반드시 있어야 하는 건
      YouTube 로고를 쓸 때뿐인데, 지금은 텍스트 "Powered by YouTube"를 쓰므로 해당
      없다. 링크를 넣을 때는 Developer Policies Guide의 "Links must open in the YouTube
      application … or … via the system web browser"를 따라 `target="_blank"`
      `rel="noreferrer"`로 새 탭에서 연다. 재생 중일 때 같은 자리에 붙는 YouTube
      iframe에는 손대지 않는다. 클릭 동작이 바뀌는 디자인 변경이라 승인을 받고
      진행한다.
