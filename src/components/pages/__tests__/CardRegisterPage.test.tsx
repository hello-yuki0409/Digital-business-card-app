import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { CardRegisterPage } from "../CardRegisterPage";

jest.mock("@zag-js/focus-visible", () => ({
  trackFocusVisible: () => {},
}));

type TableName = "skills" | "users" | "user_skill";
type SkillsRow = { id: number; name: string };
type UsersRow = {
  id: string;
  name: string;
  description: string;
  github_id: string | null;
  qiita_id: string | null;
  x_id: string | null;
};
type UserSkillRow = { user_id: string; skill_id: number };

let skillsRows: SkillsRow[] = [{ id: 1, name: "React" }];
let existingUser: UsersRow | null = null;
let insertedUsers: UsersRow[] = [];
let insertedUserSkills: UserSkillRow[] = [];

jest.mock("../../../lib/supabase", () => {
  function usersChain() {
    return {
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: existingUser,
            error: null as null,
          }),
        }),
      }),
      insert: async (rows: UsersRow[]) => {
        insertedUsers.push(...rows);
        return { error: null as null };
      },
    };
  }
  function skillsChain() {
    return {
      select: () => ({
        order: () => Promise.resolve({ data: skillsRows, error: null as null }),
      }),
    };
  }
  function userSkillChain() {
    return {
      insert: async (rows: UserSkillRow[]) => {
        insertedUserSkills.push(...rows);
        return { error: null as null };
      },
    };
  }

  return {
    supabase: {
      from: (table: TableName) => {
        if (table === "users") return usersChain();
        if (table === "skills") return skillsChain();
        return userSkillChain();
      },
    },
  };
});

function renderPageToRegister() {
  render(
    <MemoryRouter initialEntries={["/cards/register"]}>
      <Routes>
        <Route path="/cards/register" element={<CardRegisterPage />} />
        <Route path="/cards/:id" element={<h1>DETAIL</h1>} />
        <Route path="/" element={<h1>ホーム</h1>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("CardRegisterPage", () => {
  beforeEach(() => {
    skillsRows = [{ id: 1, name: "React" }];
    existingUser = null;
    insertedUsers = [];
    insertedUserSkills = [];
  });

  test("タイトルが表示される", async () => {
    renderPageToRegister();
    expect(
      await screen.findByRole("heading", { name: "名刺新規登録" })
    ).toBeInTheDocument();
  });

  test("必須バリデーション（ID/名前/スキル）", async () => {
    const user = userEvent.setup();
    renderPageToRegister();

    await screen.findByText("React");

    await user.click(screen.getByRole("button", { name: /登録/ }));

    expect(await screen.findByText("IDは必須です")).toBeInTheDocument();
    expect(await screen.findByText("名前は必須です")).toBeInTheDocument();
    expect(
      await screen.findByText("1つは選択してください")
    ).toBeInTheDocument();
  });

  test("任意項目は空でも登録でき、/cards/:id に遷移する", async () => {
    const user = userEvent.setup();
    renderPageToRegister();

    // skills ロード完了待ち
    await screen.findByText("React");

    await user.type(
      screen.getByPlaceholderText("ID は半角英字で入力してください"),
      "hellocard"
    );
    await user.type(screen.getByPlaceholderText("例: 山田太郎"), "テスト太郎");
    await user.type(
      screen.getByPlaceholderText("自己紹介を入力してください（HTML可）"),
      "紹介文"
    );

    await user.click(screen.getByLabelText("React"));

    await user.click(screen.getByRole("button", { name: /登録/ }));

    expect(await screen.findByText("DETAIL")).toBeInTheDocument();

    await waitFor(() => {
      expect(insertedUsers[0]?.id).toBe("hellocard");
      expect(insertedUserSkills[0]?.user_id).toBe("hellocard");
      expect(insertedUserSkills[0]?.skill_id).toBe(1);
    });
  });
});
