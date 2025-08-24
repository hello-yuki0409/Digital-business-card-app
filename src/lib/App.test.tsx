// fetchUserWithSkills をモックして、必ず同じ結果を返すようにする
jest.mock("./user", () => ({
  fetchUserWithSkills: jest.fn(async () => ({
    id: "u1",
    name: "太郎",
    introHtml: "desc",
    skills: [{ id: 1, name: "React" }],
  })),
}));

import { fetchUserWithSkills } from "./user";

test("モックしたユーザーを返す", async () => {
  const user = await fetchUserWithSkills("u1");
  expect(user).toEqual({
    id: "u1",
    name: "太郎",
    introHtml: "desc",
    skills: [{ id: 1, name: "React" }],
  });
});
