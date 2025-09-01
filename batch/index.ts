import dotenv from "dotenv";
dotenv.config();

import { DateTime } from "luxon";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const DRY_RUN = process.env.DRY_RUN === "1";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("[FATAL] Missing env SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

type UserRow = { id: string; created_at: string };

// Luxon の toISO() は string | null を返すので安全にラップ
function toIsoOrThrow(dt: DateTime): string {
  const s = dt.toUTC().toISO();
  if (!s) throw new Error("Failed to format ISO from DateTime");
  return s;
}

// JST 昨日0:00 ～ 今日0:00（[start, end)）をUTC ISOで返す
function getYesterdayRangeUtc(): { startIso: string; endExclusiveIso: string } {
  const zone = "Asia/Tokyo";
  const startJst = DateTime.now()
    .setZone(zone)
    .minus({ days: 1 })
    .startOf("day");
  const endExclusiveJst = startJst.plus({ days: 1 }); // 今日0:00 JST（排他的終端）
  return {
    startIso: toIsoOrThrow(startJst),
    endExclusiveIso: toIsoOrThrow(endExclusiveJst),
  };
}

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { startIso, endExclusiveIso } = getYesterdayRangeUtc();
  console.info(
    `[INFO] Deleting records created between (UTC): ${startIso} ~ ${endExclusiveIso} [start, end)`
  );
  console.info(
    `[INFO] (JST表示) ${DateTime.fromISO(startIso)
      .setZone("Asia/Tokyo")
      .toISO()} ~ ${DateTime.fromISO(endExclusiveIso)
      .setZone("Asia/Tokyo")
      .toISO()}`
  );

  // 昨日に作成された users を抽出
  const { data: users, error: selectErr } = await supabase
    .from("users")
    .select("id, created_at")
    .gte("created_at", startIso)
    .lt("created_at", endExclusiveIso);

  if (selectErr) {
    console.error("[ERROR] users select failed:", selectErr);
    process.exit(1);
  }

  const ids = (users ?? []).map((u: UserRow) => u.id);
  console.info(`[INFO] Matched users: ${ids.length}`);
  if (ids.length) {
    console.info(
      `[INFO] First few: ${ids.slice(0, 10).join(", ")}${
        ids.length > 10 ? " ..." : ""
      }`
    );
  }

  if (ids.length === 0) {
    console.info("[INFO] No users to delete. Exit.");
    return;
  }

  if (DRY_RUN) {
    console.warn("[DRY_RUN] Matched but skip deletion.");
    return;
  }

  // 先に子テーブル user_skill を削除（CASCADE があるなら不要）
  const { error: delUserSkillErr, count: delUserSkillCount } = await supabase
    .from("user_skill")
    .delete({ count: "exact" })
    .in("user_id", ids);

  if (delUserSkillErr) {
    console.error("[ERROR] user_skill delete failed:", delUserSkillErr);
    process.exit(1);
  }
  console.info(`[INFO] Deleted user_skill rows: ${delUserSkillCount ?? 0}`);

  // 親テーブル users を削除
  const { error: delUsersErr, count: delUsersCount } = await supabase
    .from("users")
    .delete({ count: "exact" })
    .in("id", ids);

  if (delUsersErr) {
    console.error("[ERROR] users delete failed:", delUsersErr);
    process.exit(1);
  }
  console.info(`[INFO] Deleted users rows: ${delUsersCount ?? 0}`);

  console.log("[SUCCESS] Cleanup completed.");
}

main().catch((e) => {
  console.error("[FATAL] Uncaught error:", e);
  process.exit(1);
});
