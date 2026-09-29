import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { YOUTUBE_API_BASE, getApiKeyOrThrow } from "../_youtube.js";
import { parseIsoDuration } from "../../src/shared/lib/format-time.js";

// GET /api/cron/refresh-youtube-data — vercel.json의 crons가 하루 한 번 호출합니다.
// YouTube API Developer Policies III.E.4.d(공개 API 데이터는 30일 넘게 저장 금지, 지나면
// 삭제 또는 갱신)에 맞춰 tracks.duration을 다시 조회해 갱신합니다. 응답에서 빠진 영상
// (삭제·비공개 전환)은 duration을 비우고 재생 불가로 표시하며, 재생 불가 곡도 매일 다시
// 확인해서 영상이 다시 공개되면 복구합니다. 실제 반영은 refresh_youtube_tracks 함수
// (docs/migrations/0004_tracks_youtube_refresh.sql)가 합니다.
//
// Vercel은 CRON_SECRET 환경변수가 있으면 cron 호출에 `Authorization: Bearer <값>`을
// 붙여 보냅니다 — 누구나 이 URL을 불러 할당량을 쓰지 못하게 그 값을 확인합니다.

// 30일 한도보다 여유를 둡니다 — Hobby 플랜 cron은 지정한 시각의 1시간 안 어딘가에 돌고,
// 하루 이틀 실패해도 30일을 넘기지 않도록.
const REFRESH_AFTER_DAYS = 25;
// videos.list의 id 파라미터 최대 개수(호출 한 번당 1 unit).
const VIDEOS_PER_REQUEST = 50;
// PostgREST가 한 번에 돌려주는 최대 행 수(Supabase 기본 max rows).
const PAGE_SIZE = 1000;

interface VideoItem {
  id: string;
  contentDetails?: { duration: string };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return res.status(500).json({ error: "CRON_SECRET 환경변수가 설정되지 않았습니다." });
  }
  if (req.headers.authorization !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: "인증되지 않은 호출입니다." });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !secretKey) {
    return res.status(500).json({ error: "서버 환경변수가 설정되지 않았습니다." });
  }
  // secret key는 RLS를 우회합니다 — 여러 사용자의 tracks를 한꺼번에 다뤄야 해서 필요.
  const supabaseAdmin = createClient(supabaseUrl, secretKey);

  try {
    const apiKey = getApiKeyOrThrow();
    const cutoff = new Date(
      Date.now() - REFRESH_AFTER_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString();

    // 같은 영상을 여러 사용자가 담아둘 수 있으니 video_id로 중복을 없앱니다.
    const videoIds = new Set<string>();
    for (let from = 0; ; from += PAGE_SIZE) {
      const { data, error } = await supabaseAdmin
        .from("tracks")
        .select("video_id")
        .or(`duration_synced_at.lt.${cutoff},unavailable_at.not.is.null`)
        .order("id")
        .range(from, from + PAGE_SIZE - 1);
      if (error) throw error;
      data.forEach((row: { video_id: string }) => videoIds.add(row.video_id));
      if (data.length < PAGE_SIZE) break;
    }

    const ids = Array.from(videoIds);
    let refreshedCount = 0;
    let missingCount = 0;

    for (let i = 0; i < ids.length; i += VIDEOS_PER_REQUEST) {
      const chunk = ids.slice(i, i + VIDEOS_PER_REQUEST);

      const videosUrl = new URL(`${YOUTUBE_API_BASE}/videos`);
      videosUrl.searchParams.set("part", "contentDetails");
      videosUrl.searchParams.set("fields", "items(id,contentDetails/duration)");
      videosUrl.searchParams.set("id", chunk.join(","));
      videosUrl.searchParams.set("key", apiKey);

      const videosRes = await fetch(videosUrl);
      const videosData = (await videosRes.json()) as { items?: VideoItem[] };
      // 할당량 초과 등으로 실패하면 여기서 멈춥니다 — 실패 응답을 "영상 없음"으로
      // 해석하면 멀쩡한 곡들이 전부 재생 불가로 표시됩니다. 처리 못 한 곡은 다음
      // 실행 때 다시 대상이 됩니다.
      if (!videosRes.ok) {
        return res.status(502).json({
          error: "YouTube videos.list 호출 실패",
          detail: videosData,
          refreshed: refreshedCount,
          missing: missingCount,
        });
      }

      const found = new Map(
        (videosData.items ?? []).map((item) => [
          item.id,
          item.contentDetails ? parseIsoDuration(item.contentDetails.duration) : 0,
        ]),
      );
      const refreshed = Array.from(found, ([video_id, duration]) => ({
        video_id,
        duration,
      }));
      const missing = chunk.filter((id) => !found.has(id));

      const { error } = await supabaseAdmin.rpc("refresh_youtube_tracks", {
        refreshed,
        missing,
      });
      if (error) throw error;
      refreshedCount += refreshed.length;
      missingCount += missing.length;
    }

    return res.status(200).json({
      videos: ids.length,
      refreshed: refreshedCount,
      missing: missingCount,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: err instanceof Error ? err.message : "unknown error" });
  }
}
