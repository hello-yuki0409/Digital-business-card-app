import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

function assertEnv(name: string, val: string) {
  if (!val) {
    console.error(`[FATAL] Missing env: ${name}`);
    process.exit(1);
  }
}
assertEnv("SUPABASE_URL", SUPABASE_URL);
assertEnv("SUPABASE_SERVICE_ROLE_KEY", SUPABASE_SERVICE_ROLE_KEY);

// Service Role で管理削除を実行
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// JST(UTC+9) の 昨日 00:00〜23:59:59.999 を UTC に変換して返す
function getYesterdayRangeUtc(): { startUtcIso: string; endUtcIso: string } {
  const JST_OFFSET_MIN = 9 * 60;
  const nowJst = new Date(Date.now() + JST_OFFSET_MIN * 60_000);
  const y = nowJst.getFullYear();
  const m = nowJst.getMonth();
  const d = nowJst.getDate();

  // 昨日(JST)
  const startJst = new Date(y, m, d - 1, 0, 0, 0, 0);
  const endJst = new Date(y, m, d - 1, 23, 59, 59, 999);

  // JST -> UTC
  const startUtc = new Date(startJst.getTime() - JST_OFFSET_MIN * 60_000);
  const endUtc = new Date(endJst.getTime() - JST_OFFSET_MIN * 60_000);

  return {
    startUtcIso: startUtc.toISOString(),
    endUtcIso: endUtc.toISOString(),
  };
}

async function main(): Promise<void> {
  const { startUtcIso, endUtcIso } = getYesterdayRangeUtc();
  // かくにんよう
  console.log(
    `[INFO] Deleting records created between ${startUtcIso} ~ ${endUtcIso} (UTC)`
  );

  // 昨日作成の users を取得
  const { data: users, error: usersSelErr } = await supabase
    .from("users")
    .select("id, created_at")
    .gte("created_at", startUtcIso)
    .lte("created_at", endUtcIso);

  if (usersSelErr) {
    console.error("[ERROR] users select:", usersSelErr);
    process.exit(1);
  }

  const userIds: string[] = (users ?? []).map((u: { id: string }) => u.id);
  console.log(`[INFO] Target users: ${userIds.length}`);

  // 対象ユーザーの user_skill を削除
  if (userIds.length > 0) {
    const { error: usDelByUserErr } = await supabase
      .from("user_skill")
      .delete()
      .in("user_id", userIds);

    if (usDelByUserErr) {
      console.error("[ERROR] user_skill delete by user_id:", usDelByUserErr);
      process.exit(1);
    }
    console.log(
      `[INFO] Deleted user_skill by user_id for ${userIds.length} users.`
    );
  }

  // 一応昨日作った user_skill も削除
  const { error: usDelByDateErr } = await supabase
    .from("user_skill")
    .delete()
    .gte("created_at", startUtcIso)
    .lte("created_at", endUtcIso);

  if (usDelByDateErr) {
    console.error("[ERROR] user_skill delete by date:", usDelByDateErr);
    process.exit(1);
  }
  console.log("[INFO] Deleted user_skill by created_at range (safety pass).");

  // 昨日作成した users を削除
  const { error: usersDelErr } = await supabase
    .from("users")
    .delete()
    .gte("created_at", startUtcIso)
    .lte("created_at", endUtcIso);

  if (usersDelErr) {
    console.error("[ERROR] users delete:", usersDelErr);
    process.exit(1);
  }

  console.log("[SUCCESS] Cleanup completed.");
}

main().catch((e) => {
  console.error("[FATAL] Uncaught error:", e);
  process.exit(1);
});
