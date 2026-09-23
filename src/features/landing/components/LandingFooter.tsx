// 1236px 폭(부모가 배치). "Developed with YouTube" 배지는 LandingHero(큰 타이포그래피
// 위)에도 있지만, YouTube API Branding Guidelines가 배지를 요구하는 자리라 여기서도
// 그대로 유지합니다(AuthLayout.tsx가 쓰는 것과 같은 public/developed-with-youtube.png).
export default function LandingFooter() {
  return (
    <div className="flex items-center justify-between gap-6 border-t border-(--neu-border-75) pt-6.5 pr-0.5 pb-8.5 pl-0.5">
      <div className="font-neu-mono text-[11px] tracking-widest text-(--neu-ink-52)">
        © 2026 NEUMORPLAYER
      </div>
      <img
        src="/developed-with-youtube.png"
        alt="Developed with YouTube"
        className="w-37.5 opacity-85"
      />
    </div>
  );
}
