import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "../HomePage";

type UsersRow = { id: string };
let existingId: string | null = "abc";

jest.mock("../../../lib/supabase", () => {
  return {
    supabase: {
      from: () => ({
        select: () => ({
          eq: (_col: string, val: string) => ({
            maybeSingle: async (): Promise<{
              data: UsersRow | null;
              error: null;
            }> => {
              const hit = existingId === val ? ({ id: val } as UsersRow) : null;
              return { data: hit, error: null };
            },
          }),
        }),
      }),
    },
  };
});

function renderHome() {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cards/:id" element={<h1>Detail</h1>} />
        <Route path="/cards/register" element={<h1>Register</h1>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("HomePage", () => {
  beforeEach(() => {
    existingId = "abc";
  });

  test("タイトルが表示されている", () => {
    renderHome();
    expect(
      screen.getByRole("heading", { name: "デジタル名刺アプリ" })
    ).toBeInTheDocument();
  });

  test("IDを入力して送信すると /cards/:id に遷移（存在する場合）", async () => {
    const user = userEvent.setup();
    renderHome();

    await user.type(screen.getByLabelText("ID"), "abc");
    await user.click(screen.getByRole("button", { name: "名刺を見る" }));

    expect(await screen.findByText("Detail")).toBeInTheDocument();
  });

  test("IDを入力しないで送信するとエラーメッセージが出る", async () => {
    const user = userEvent.setup();
    renderHome();

    await user.click(screen.getByRole("button", { name: "名刺を見る" }));
    expect(await screen.findByText("IDを入力してください")).toBeInTheDocument();
  });

  test("存在しないIDだとエラーメッセージが出る", async () => {
    const user = userEvent.setup();
    existingId = null; // 何もヒットしないように
    renderHome();

    await user.type(screen.getByLabelText("ID"), "zzz");
    await user.click(screen.getByRole("button", { name: "名刺を見る" }));

    expect(await screen.findByText("このIDは存在しません")).toBeInTheDocument();
  });

  test("「名刺を登録する」を押すと /cards/register に遷移", async () => {
    const user = userEvent.setup();
    renderHome();

    await user.click(screen.getByRole("link", { name: "名刺を登録する" }));
    expect(await screen.findByText("Register")).toBeInTheDocument();
  });
});
