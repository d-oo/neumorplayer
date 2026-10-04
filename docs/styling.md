# 스타일링

`CLAUDE.md`의 스타일 규칙에 대한 자세한 설명입니다. 여러 컴포넌트가 같은 style 값을
공유할 때 어디에 둘지(`shared/styles` vs `shared/components`)는
`docs/feature-conventions.md`를 보세요.

## Tailwind CSS v4 구성

Tailwind CSS v4를 `@tailwindcss/vite` 플러그인으로 씁니다. v4는 CSS-first라
`tailwind.config.js`/`postcss.config.js`가 없고, `src/index.css` 맨 위의
`@import "tailwindcss";`가 전부입니다. box-sizing 리셋, 폼 요소 font-family 상속 등은
Tailwind preflight가 처리하므로 `index.css`에 따로 두지 않습니다.

컴포넌트는 전부 Tailwind 유틸리티 클래스로 작성합니다. CSS Modules는 더 이상 쓰지 않습니다
(있던 것도 삭제함).

## 디자인 토큰과 다크 모드

- 색·그림자 토큰은 `src/index.css`의 `:root`에 `--neu-*` 이름으로 원본이 정의되어 있고,
  다크 모드 값은 `:root[data-theme="dark"]`에서 같은 이름으로 다시 정의됩니다(테마 전환은
  `src/shared/lib/theme.ts`가 `<html data-theme>`를 바꿔서 합니다).
- 그 아래 `@theme` 블록이 이 토큰을 `var()`로 참조해 `--color-neu-*`/`--shadow-neu-*`
  네임스페이스로 다시 노출합니다 — 그래서 `bg-neu-surface`, `text-neu-muted`,
  `shadow-neu-raised` 같은 유틸리티가 테마를 따라갑니다. `@theme`에 노출하지 않은 토큰은
  `text-(--neu-ink-40)`처럼 CSS 변수를 직접 참조합니다.
- **새 색/그림자를 추가할 땐 `@theme` 안에서 직접 값을 정의하지 말고**, `:root`(필요하면
  다크 블록에도)의 원본 토큰을 늘린 뒤 `@theme`에서는 참조만 추가하세요.
- 토큰이 아니라 컴포넌트에 직접 적은 라이트 모드 색/그림자 리터럴은
  `useThemed()`(`src/shared/lib/theme.ts`)로 감싸면 다크 모드에서 `darkify()` 규칙으로
  변환됩니다.

## 임의값 문법

임의값 문법(`rounded-[6px]` 등)은 표준 표기로 대응이 안 될 때만 씁니다 — 예를 들어
`rounded-[6px]`는 `rounded-md`와 정확히 같은 값이니 `rounded-md`로 씁니다. 반대로 시안의
정확한 픽셀 값(라운드 10px/16px, 패딩 11px 등)이 Tailwind 기본 스케일에 없으면 임의값
그대로 둡니다 — 어색해 보여도 의도한 값이니 가까운 스케일 값으로 반올림하지 마세요.

글자 크기는 예외적으로 조심해야 합니다: `text-xs` 같은 이름 붙은 크기는 line-height까지
같이 정하지만 `text-[12px]`는 font-size만 정합니다. 그래서 값이 같아 보여도
`text-[12px]` → `text-xs`로 바꾸면 줄 높이가 바뀝니다.
