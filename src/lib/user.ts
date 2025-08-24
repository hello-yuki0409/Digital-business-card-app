import { supabase } from "./supabase";
import type { Skill, User, UserRow } from "../types/user";
import { UserFactory as Factory } from "../types/user";

type UserSkillRow = { skill_id: number };

export async function fetchUserWithSkills(
  userId: string
): Promise<User | null> {
  // 1) users
  const { data: userRow, error: userErr } = await supabase
    .from("users")
    .select("id, name, description, github_id, qiita_id, x_id")
    .eq("id", userId)
    .maybeSingle();

  if (userErr) {
    console.error("[users] error", userErr);
    return null;
  }
  if (!userRow) return null;

  // 2) user_skill
  const { data: userSkillRows, error: usErr } = await supabase
    .from("user_skill")
    .select("skill_id")
    .eq("user_id", userId);

  if (usErr) {
    console.error("[user_skill] error", usErr);
    return null;
  }

  // 暗黙 any を回避：行型を明示
  const skillIds = ((userSkillRows ?? []) as UserSkillRow[]).map(
    (r: UserSkillRow) => r.skill_id
  );

  let skills: Skill[] = [];

  // 3) skills
  if (skillIds.length > 0) {
    const { data: skillRows, error: sErr } = await supabase
      .from("skills")
      .select("id, name")
      .in("id", skillIds);

    if (sErr) {
      console.error("[skills] error", sErr);
      return null;
    }
    skills = (skillRows ?? []) as Skill[];
  }

  // 4) User 組み立て
  return Factory.from(userRow as UserRow, skills);
}
