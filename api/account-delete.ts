import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

// POST /api/account-delete — Authorization: Bearer <access_token>
// docs/todos.md의 "회원 탈퇴" 항목: auth.admin.deleteUser()는 secret key(구:
// service role key)가 있어야만 호출 가능해 서버 전용으로 둔다. auth.users를
// 지우면 tracks/playlists가 on delete cascade로 같이 정리된다(0001_init.sql).
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST만 허용됩니다." });
  }

  const authHeader = req.headers.authorization;
  const accessToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;
  if (!accessToken) {
    return res.status(401).json({ error: "인증 토큰이 없습니다." });
  }

  // URL은 공개되어도 안전한 값이라 클라이언트와 같은 VITE_SUPABASE_URL을 그대로
  // 씁니다. secret key만 별도 서버 전용 환경변수로 읽습니다(VITE_ 접두사 금지).
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !secretKey) {
    return res.status(500).json({ error: "서버 환경변수가 설정되지 않았습니다." });
  }

  const supabaseAdmin = createClient(supabaseUrl, secretKey);

  const { data: userData, error: userError } =
    await supabaseAdmin.auth.getUser(accessToken);
  if (userError || !userData.user) {
    return res.status(401).json({ error: "유효하지 않은 세션입니다." });
  }

  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
    userData.user.id,
  );
  if (deleteError) {
    return res.status(500).json({ error: deleteError.message });
  }

  return res.status(200).json({ ok: true });
}
