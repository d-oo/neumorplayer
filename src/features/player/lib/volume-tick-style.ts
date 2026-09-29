// 볼륨 노브 눈금의 색 규칙 — VolumeKnob(React 렌더)과 useCdPlayerPhysics(드래그 중 리렌더
// 없이 DOM에 직접 칠하기)가 같은 규칙을 쓰도록 한 곳에 둡니다(컴포넌트 파일에서 함수를
// export하면 react-refresh/only-export-components에 걸려서 lib로 뺐습니다).
//
// docs/design/의 시안 값 그대로 — 기본 액센트 #b344ff가 아니라 이 값을 씁니다. var() 참조라
// 다크모드에서도 index.css의 토큰을 그대로 따라갑니다 — 드래그 중 tick.style.background에
// 직접 써도 문자열 자체가 CSS 변수 참조라 브라우저가 계속 캐스케이드로 해석합니다.
const TICK_ON = "var(--neu-hi)";
const TICK_OFF = "var(--neu-tick-off)";
// 음소거 중엔 켜진 눈금을 연한 색으로, 빛번짐 없이 그립니다(볼륨 위치는 그대로 보임).
const TICK_MUTED = "var(--neu-tick-muted)";

export function tickStyle(lit: boolean, muted: boolean) {
  if (!lit) return { background: TICK_OFF, boxShadow: "none" };
  if (muted) return { background: TICK_MUTED, boxShadow: "none" };
  return { background: TICK_ON, boxShadow: `0 0 9px ${TICK_ON}` };
}
