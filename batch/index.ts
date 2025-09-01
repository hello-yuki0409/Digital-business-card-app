import dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL ?? "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const DRY_RUN = process.env.DRY_RUN === "1";

if (!supabaseUrl || !serviceRoleKey) {
  console.error("[FATAL] Missing env SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

type UserRow = { id: string; created_at: string };

function getYesterdayRangeUtc(): { startUtc: Date; endUtc: Date } {
  const now = new Date(); // 現在(UTC)
  const JST_OFFSET = 9 * 60 * 60 * 1000;

  // JST 昨日の 0:00
  const jstYesterdayStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  jstYesterdayStart.setHours(0, 0, 0, 0);

  // JST 昨日の 23:59:59.999
  const jstYesterdayEnd = new Date(jstYesterdayStart);
  jstYesterdayEnd.setHours(23, 59, 59, 999);

  // UTC に変換
  const startUtc = new Date(jstYesterdayStart.getTime() - JST_OFFSET);
  const endUtc = new Date(jstYesterdayEnd.getTime() - JST_OFFSET);

  return { startUtc, endUtc };
}

async function main() {
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { startUtc, endUtc } = getYesterdayRangeUtc();
  const startIso = startUtc.toISOString();
  const endIso = endUtc.toISOString();

  console.info(
    `[INFO] Target window (UTC): ${startIso} ~ ${endIso}  (JST 昨日1日分)`
  );

  const { data: users, error: selectErr } = await supabase
    .from("users")
    .select("id, created_at")
    .gte("created_at", startIso)
    .lte("created_at", endIso);

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
    console.warn("[DRY_RUN] Skipped deletion.");
    return;
  }

  const { error: delUserSkillErr, count: delUserSkillCount } = await supabase
    .from("user_skill")
    .delete({ count: "exact" })
    .in("user_id", ids);

  if (delUserSkillErr) {
    console.error("[ERROR] user_skill delete failed:", delUserSkillErr);
    process.exit(1);
  }
  console.info(`[INFO] Deleted user_skill rows: ${delUserSkillCount ?? 0}`);

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
