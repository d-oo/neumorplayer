// docs/design/다크모드.zip(design_handoff_4a/Dashboard Dark.dc.html)에 내장돼 있던
// darkify() 알고리즘을 그대로 이식한 것입니다 — 라이트 모드 CSS 값 문자열(oklch/rgba/hex)을
// 받아 검증된 다크 모드 대응값으로 바꿉니다. 손으로 다크 값을 새로 짓지 않고 항상 이 함수를
// 거치게 해서, 시안에서 확인된 변환 규칙과 어긋나는 값이 생기지 않도록 합니다.
const DK_SPECIAL: [string, string][] = [
  ["oklch(0.94 0.038 312)", "oklch(@0.46 0.13 308)"],
  ["oklch(0.885 0.055 312)", "oklch(@0.36 0.14 308)"],
  ["oklch(0.95 0.045 312)", "oklch(@0.5 0.14 308)"],
  ["oklch(0.9 0.062 312)", "oklch(@0.4 0.15 308)"],
  ["#6d1a9f", "#d6a4ff"],
  ["#7b1fb0", "#c98cff"],
];
const DK_SHADOW = [
  "142,128,166",
  "146,132,170",
  "150,136,175",
  "138,110,172",
  "150,120,182",
  "124,94,164",
];

const dkL = (L: number) => (L >= 0.8 ? 0.235 + (L - 0.935) * 1.6 : L < 0.62 ? 1.22 - L : L);
const dkA = (a: number) => +Math.min(1, a).toFixed(3);

export function darkify(value: string): string {
  let s = value;
  for (const [from, to] of DK_SPECIAL) s = s.split(from).join(to);
  s = s.replace(
    /oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)/g,
    (_m, L, C, H) => "oklch(" + +dkL(+L).toFixed(3) + " " + C + " " + H + ")",
  );
  s = s.split("oklch(@").join("oklch(");
  return s.replace(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/g, (m, r, g, b, a) => {
    const k = `${r},${g},${b}`;
    const alpha = +a;
    if (k === "255,255,255") return `rgba(255,255,255,${dkA(alpha * 0.075)})`;
    if (DK_SHADOW.includes(k)) return `rgba(6,3,12,${dkA(Math.min(0.9, alpha * 1.35))})`;
    if (k === "118,100,145" || k === "126,110,156")
      return `rgba(200,180,235,${dkA(alpha * 0.55)})`;
    if (k === "120,100,145") return `rgba(255,255,255,${dkA(alpha * 0.55)})`;
    return m;
  });
}
