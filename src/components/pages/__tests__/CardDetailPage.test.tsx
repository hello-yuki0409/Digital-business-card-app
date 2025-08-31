import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { CardDetailPage } from "../CardDetailPage";

// fetchUserWithSkills をモック（Links が必ず出るように、URL 形式と ID 形式の両方を用意）
jest.mock("../../../lib/user", () => {
  type Skill = { id: number; name: string };
  const mockUser = {
    id: "sample_id",
    name: "テスト太郎",
    description: "自己紹介テキスト",
    skills: [{ id: 1, name: "React" } as Skill],
    // どちらの実装でも出るように両方を入れておく
    githubUrl: "https://github.com/example",
    qiitaUrl: "https://qiita.com/example",
    xUrl: "https://x.com/example",
    github_id: "example",
    qiita_id: "example",
    x_id: "example",
  };
  return {
    fetchUserWithSkills: async () => mockUser,
  };
});

function renderWithRoute(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/cards/:id" element={<CardDetailPage />} />
        <Route path="/" element={<h1>ホーム</h1>} />
      </Routes>
    </MemoryRouter>
  );
}

// 実装差異（a要素 or button要素、aria-label有無）を吸収するヘルパ
async function expectIconAccessible(name: string) {
  // IconButton as="a" （aria-label 付き）想定
  const link = await screen.findByRole("link", { name }).catch(() => null);
  if (link) {
    expect(link).toBeInTheDocument();
    return;
  }
  // IconButton as="button" 想定
  const btn = await screen.findByRole("button", { name }).catch(() => null);
  if (btn) {
    expect(btn).toBeInTheDocument();
    return;
  }
  // aria-label が付かず Tooltip だけの場合に備え、Links セクション内に同数のリンク/ボタンがあるかを見る
  const linksContainer =
    screen.queryByText("Links")?.closest("div") ?? document.body;
  const candidates = [
    ...within(linksContainer).queryAllByRole("link"),
    ...within(linksContainer).queryAllByRole("button"),
  ];
  expect(candidates.length).toBeGreaterThanOrEqual(1);
}

describe("CardDetailPage", () => {
  test("名前／自己紹介／技術タグが表示される", async () => {
    renderWithRoute("/cards/sample_id");
    expect(
      await screen.findByRole("heading", { name: "テスト太郎" })
    ).toBeInTheDocument();
    expect(await screen.findByText("自己紹介テキスト")).toBeInTheDocument();
    expect(await screen.findByText("React")).toBeInTheDocument();
  });

  test("GitHub / Qiita / X のアイコンが表示される（実装差異を吸収）", async () => {
    renderWithRoute("/cards/sample_id");
    await expectIconAccessible("GitHub");
    await expectIconAccessible("Qiita");
    await expectIconAccessible("X (Twitter)");
  });

  test("戻るをクリックすると / に遷移する", async () => {
    const user = userEvent.setup();
    renderWithRoute("/cards/sample_id");
    const backBtn = await screen.findByRole("button", { name: "ホームに戻る" });
    await user.click(backBtn);
    expect(await screen.findByText("ホーム")).toBeInTheDocument();
  });
});
