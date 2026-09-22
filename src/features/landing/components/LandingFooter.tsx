// 1236px 폭(부모가 배치). "Developed with YouTube" 배지는 AuthLayout.tsx가 쓰는
// 것과 같은 public/developed-with-youtube.png 파일을 그대로 재사용합니다.
export default function LandingFooter() {
  return (
    <div className="flex items-center justify-between gap-6 border-t border-white/75 pt-6.5 pr-0.5 pb-8.5 pl-0.5">
      <div className="font-neu-mono text-[11px] tracking-widest text-[oklch(0.52_0.02_315)]">
        © 2026 NEUMORPLAYER · POWERED BY YOUTUBE
      </div>
      <img
        src="/developed-with-youtube.png"
        alt="Developed with YouTube"
        className="w-37.5 opacity-85"
      />
    </div>
  );
}
