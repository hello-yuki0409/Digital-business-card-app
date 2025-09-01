import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL ?? "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "[FATAL] Missing env: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

// JSTからUTCへ変換。昨日の日付だけを削除対象にする
function getYesterdayRangeUtc(): { startUtc: Date; endUtc: Date } {
  const now = new Date();
  const JST_OFFSET = 9 * 60 * 60 * 1000;

  // JST 昨日の0:00
  const jstYesterdayStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  jstYesterdayStart.setHours(0, 0, 0, 0);

  // JST 昨日の23:59:59
  const jstYesterdayEnd = new Date(jstYesterdayStart);
  jstYesterdayEnd.setHours(23, 59, 59, 999);

  // UTCにトランスフォーム
  const startUtc = new Date(jstYesterdayStart.getTime() - JST_OFFSET);
  const endUtc = new Date(jstYesterdayEnd.getTime() - JST_OFFSET);

  return { startUtc, endUtc };
}

async function main() {
  const { startUtc, endUtc } = getYesterdayRangeUtc();
  console.log("[INFO] Deleting records created between", startUtc, "~", endUtc);

  // usersテーブル削除する処理
  const { error: usersError } = await supabase
    .from("users")
    .delete()
    .gte("created_at", startUtc.toISOString())
    .lte("created_at", endUtc.toISOString());

  if (usersError) {
    console.error("[ERROR] users delete:", usersError);
    return;
  }

  // user_skillテーブル削除
  const { error: skillsError } = await supabase
    .from("user_skill")
    .delete()
    .gte("created_at", startUtc.toISOString())
    .lte("created_at", endUtc.toISOString());

  if (skillsError) {
    console.error("[ERROR] user_skill delete:", skillsError);
    return;
  }

  console.log("[SUCCESS] Cleanup completed.");
}

main();
