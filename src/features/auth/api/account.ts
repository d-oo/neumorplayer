import { supabase } from "@/shared/lib/supabase";

// SettingsModal의 회원탈퇴 확인에서 호출합니다. 계정 삭제(auth.admin.deleteUser)는
// secret key가 있어야 해서 서버(/api/account-delete)에서만 수행하고, 여기선 현재
// 세션의 access token을 실어 보내기만 합니다.
export async function deleteAccount(): Promise<void> {
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;
  if (!accessToken) {
    throw new Error("로그인 세션이 없습니다.");
  }

  const res = await fetch("/api/account-delete", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const body: { error?: string } | null = await res.json().catch(() => null);
    throw new Error(body?.error ?? "회원 탈퇴에 실패했습니다.");
  }
}
