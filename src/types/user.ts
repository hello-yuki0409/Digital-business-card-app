export type Skill = {
  id: number;
  name: string;
};

export type UserRow = {
  id: string;
  name: string;
  description?: string | null;
  github_id?: string | null;
  qiita_id?: string | null;
  x_id?: string | null;
};

export type User = {
  id: string;
  name: string;
  description: string;
  skills: Skill[];
  github_id?: string;
  qiita_id?: string;
  x_id?: string;
};

export class UserFactory {
  static from(row: UserRow, skills: Skill[]): User {
    const github_id = row.github_id
      ? `https://github.com/${row.github_id}`
      : undefined;
    const qiita_id = row.qiita_id
      ? `https://qiita.com/${row.qiita_id}`
      : undefined;
    const x_id = row.x_id ? `https://x.com/${row.x_id}` : undefined;

    return {
      id: row.id,
      name: row.name,
      description: row.description ?? "",
      skills,
      github_id,
      qiita_id,
      x_id,
    };
  }
}
