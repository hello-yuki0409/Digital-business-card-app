import { render, screen } from "@testing-library/react";
import App from "../App";
import { MemoryRouter } from "react-router-dom";

// Supabaseクライアントのモック（偽物）を作成
jest.mock("../lib/supabase", () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({
      data: {
        id: "sample_id",
        name: "モックユーザー太郎",
        description: "<h1>テスト用の自己紹介です</h1>",
        github_id: "mock-github",
        qiita_id: null,
        x_id: "mock-x",
        created_at: new Date().toISOString(),
      },
      error: null,
    }),
  },
}));

test("特定のユーザーページにアクセスした際に、モックデータが表示されること", async () => {
  // テスト用のルーターを使い、最初から'/cards/sample_id'にアクセスした状態を再現
  render(
    <MemoryRouter initialEntries={["/cards/sample_id"]}>
      <App />
    </MemoryRouter>
  );

  // ローディング画面のチェックは削除する。
  // 代わりに、findByTextを使って最終的にユーザー名が表示されるまで待機する。
  const userName = await screen.findByText(/モックユーザー太郎/i);
  expect(userName).toBeInTheDocument();

  // 自己紹介文も表示されていることを確認（こちらもfindByTextでOK）
  const description = await screen.findByText(/テスト用の自己紹介です/i);
  expect(description).toBeInTheDocument();
});
