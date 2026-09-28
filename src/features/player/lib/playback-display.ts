// 재생 버튼 아이콘, CD 회전, 목록·곡 정보의 비주얼라이저는 한몸처럼 움직여야 해서
// (사용자 요청) 전부 아래 두 값만 봅니다. 화면 표시는 세 가지뿐입니다:
// - 멈춤(!isPlaying): 재생 아이콘 / CD 정지 / 비주얼라이저 정지
// - 불러오는 중(selectIsLoading): 스피너 / CD 정지 / 비주얼라이저 정지 — 재생을
//   누른 직후부터 YouTube가 실제 PLAYING을 알릴 때까지(버퍼링 포함). "버퍼링 중인지"만
//   보면 누른 직후 BUFFERING 신호가 오기 전 한순간 일시정지 아이콘이 깜빡였습니다.
// - 재생 중(selectIsAudible): 일시정지 아이콘 / CD 회전 / 비주얼라이저 움직임
// 화면 표시에는 isPlaying을 직접 쓰지 말고 이 셀렉터들을 쓰세요. 버튼을 누르면
// isPlaying(의도)을 뒤집습니다 — 스피너 상태에서 누르면 재생 취소.
//
// 대시보드(usePlayerStore에 셀렉터로 그대로 넘김)와 랜딩(useGuestPlayer의 값으로 직접
// 호출)이 같이 쓰도록 스토어 밖의 순수 함수로 둡니다 — 랜딩이 usePlayerStore 모듈에
// 의존하지 않게 하려는 것이기도 합니다.
export type PlaybackFlags = { isPlaying: boolean; isVideoPlaying: boolean };

export const selectIsAudible = (s: PlaybackFlags) =>
  s.isPlaying && s.isVideoPlaying;

export const selectIsLoading = (s: PlaybackFlags) =>
  s.isPlaying && !s.isVideoPlaying;
