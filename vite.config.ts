import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Vite 8의 향후 기본 config loader(`native`)가 __dirname을 지원하지 않아서
      // import.meta.dirname을 씁니다(Node 20.11+/21.2+ 필요 — 이미 vite 8의 engines
      // 요구사항이 이보다 높아서 문제없습니다).
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  server: {
    // /api(Vercel Functions)는 vite dev 서버가 직접 못 다루므로 `vercel dev`(3000번
    // 포트, api 전용으로만 씀 — 브라우저는 계속 이 vite 서버를 봅니다)로 넘깁니다.
    // vercel.json의 SPA 카탈올 rewrite(/(.*)→/index.html)는 `vercel dev`가 프론트엔드
    // 요청까지 직접 받을 때만 문제(/@vite/client 등 Vite 전용 경로까지 가로채 index.html을
    // 돌려줘 앱이 아예 안 뜸)가 되므로, 브라우저가 vite dev 서버(이 포트)만 보고 vercel
    // dev는 /api 프록시 대상으로만 쓰면 그 문제 자체를 피할 수 있습니다.
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
