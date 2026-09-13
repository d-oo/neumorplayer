import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase 환경변수가 없습니다. .env.example을 참고해 .env.local을 만들어주세요."
  );
}

// anon key는 공개되어도 안전합니다 — 실제 데이터 접근 제어는 Postgres RLS 정책이 담당합니다.
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
