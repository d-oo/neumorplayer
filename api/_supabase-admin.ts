import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// secret key로 만든 관리자용 Supabase 클라이언트 — RLS를 우회하므로 서버(api/)에서만
// 씁니다(회원탈퇴의 auth.admin.deleteUser, 여러 사용자의 tracks를 다루는 갱신 cron).
// URL은 공개되어도 안전한 값이라 클라이언트와 같은 VITE_SUPABASE_URL을 그대로 쓰고,
// secret key만 별도 서버 전용 환경변수로 읽습니다(VITE_ 접두사 금지).
//
// 환경변수가 빠졌으면 클라이언트 대신 빠진 변수 이름을 돌려줍니다(값은 담지 않음) —
// 어떤 응답/로그를 남길지는 호출부마다 달라서 호출부가 정합니다.
export function createSupabaseAdmin():
  | { supabaseAdmin: SupabaseClient; missingEnv: null }
  | { supabaseAdmin: null; missingEnv: string[] } {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !secretKey) {
    const missingEnv = [
      !supabaseUrl && "VITE_SUPABASE_URL",
      !secretKey && "SUPABASE_SECRET_KEY",
    ].filter((name): name is string => Boolean(name));
    return { supabaseAdmin: null, missingEnv };
  }
  return { supabaseAdmin: createClient(supabaseUrl, secretKey), missingEnv: null };
}
