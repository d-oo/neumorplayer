import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    "Supabase 환경변수가 없습니다. .env.example을 참고해 .env.local을 만들어주세요.",
  );
}

// publishable key(예전 이름: anon key)는 공개되어도 안전합니다 — 실제 데이터 접근 제어는
// Postgres RLS 정책이 담당합니다. secret key(예전 이름: service_role key)는 RLS를 우회하니
// 절대 이 파일이나 다른 클라이언트 코드에 넣지 마세요.
export const supabase = createClient<Database>(
  supabaseUrl,
  supabasePublishableKey,
);
