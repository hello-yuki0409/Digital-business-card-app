# デジタル名刺アプリ

![2025-09-0323 30 34-ezgif com-video-to-gif-converter](https://github.com/user-attachments/assets/30a16024-2c7b-4b2a-9c1d-f09a0a9f54cc)

## サービスの説明

ユーザーが自分のプロフィールやスキルを登録し「デジタル名刺」として使える Web アプリです。  

React（Vite 環境）＋ Supabase を利用して作成。
自動テスト ＆ CI/CD パイプラインも整備しています。

## 主な機能

- 自己紹介カード（名刺）の登録・表示
- 名前・ID・自己紹介・好きな技術（複数選択可）の登録
- GitHub / Qiita / X（Twitter）の SNS アイコンリンク
- ID 入力で他ユーザーの名刺ページを閲覧可能（基本しない想定）
- 入力バリデーション（React Hook Form を使用）
- 自動テスト / CI/CD パイプライン完備
- バッチ処理でユーザーデータを翌朝 6 時に削除（Supabase + GitHub Actions）

## 技術スタック

- [React](https://react.dev/) (Vite + TypeScript)
- [Chakra UI](https://chakra-ui.com/)（UI コンポーネント）
- [React Hook Form](https://react-hook-form.com/)（バリデーション）
- [Supabase](https://supabase.com/)（DB, 認証）
- [Jest](https://jestjs.io/) + [React Testing Library](https://testing-library.com/)（テスト）
- [Firebase Hosting](https://firebase.google.com/?hl=ja)（ホスティング・デプロイ）
- [GitHub Actions](https://docs.github.com/ja/actions)（CI/CD, バッチ処理）
- [Makefile](https://www.gnu.org/software/make/manual/make.html)（デプロイ補助）
- [ESLint](https://eslint.org/)（静的コード解析）

## 開発・実行環境

- **フロントエンド**: Vite + React (TypeScript)
- **バックエンド**: Supabase（PostgreSQL/認証）
- **デプロイ**: Firebase Hosting
- **バリデーション**:　React Hook Form
- **テスト**: Jest, React Testing Library
- **CI/CD**: GitHub Actions
- **パッケージ管理**: npm
- **その他**: Makefile（手動デプロイ補助）

## 環境設定の方法

### 1. リポジトリをクローン

```bash
git clone https://github.com/hello-yuki0409/Digital-business-card-app
cd Digital-business-card-app
```

### 2. 必要なパッケージをインストール
```bash
npm install
```

### 4. 環境変数の設定

下記を参考に`.env`ファイルを作成

```ini
VITE_SUPABASE_URL=xxx
VITE_SUPABASE_ANON_KEY=yyy
```
バッチ処理用には以下も必要です。
```ini
SUPABASE_URL=xxx
SUPABASE_SERVICE_ROLE_KEY=zzz
```
## 起動方法

### 開発サーバーを立ち上げる

```bash
npm run dev
```
ブラウザで http://localhost:5173 を開く

## ビルド方法

```bash
npm run build
```

`dist/`フォルダが生成されます

### テストの実行

```bash
npm run test
```

- Jest + React Testing Library で自動テストを実行
- ページごとにテストファイルを分割済み

## デプロイ方法

### 自動デプロイ（GitHub Actions）

`main`ブランチへの push 等で自動で Firebase Hosting にデプロイされます。

### 手動デプロイ（Makefile）

下記コマンドで手動デプロイも可能です。<br>
事前に Firebase CLI 認証（firebase login）をしておく必要があります

```bash
make deploy
```
## データベース構成（Supabase）

- [Supabase](https://supabase.com/)のアカウントを作成する
- 新規プロジェクトを作成する(プロジェクト名は`users` `user_skill` `skills`の3つ。データベースパスワードは任意)
- Table Editor で以下のテーブルを作成する

### users テーブル

| Name     | Type         | Default　Value   |
| ------------- | ---------- | ----------- |
| `id`          | varchar       | NULL  |
| `name`        | varchar       | NULL |
| `description` | text       | NULL |
| `github_id`   | varchar       | NULL |
| `qiita_id`    | varchar       | NULL  |
| `x_id`        | varchar       | NULL   |
| `created_at`  | timestamptz| now() |

### user_skill テーブル
ユーザーIDとスキルIDを結ぶ中間テーブル

| Name     | Type   | Default　Value   |
| ---------- | --- | ----------------- |
| `id`  | varchar | NULL |
| `user_id`  | varchar | NULL  |
| `skill_id` | int8 | NULL |
| `created_at`  | timestamptz| now() |

### skills テーブル
プログラミングの技術を保存しておくテーブル

| Name     | Type         | Default　Value   |
| -------- | --- | ------------------- |
| `id`     | int8 | NULL |
| `name`   | varchar| NULL  |
| `created_at`  | timestamptz| now() |

## バッチ処理（ユーザー削除）

### 概要
毎日 **朝 6 時 (JST)** に前日作成された `users` と `user_skill` レコードを削除するバッチ処理を実行。  
GitHub Actions の cron ジョブで自動実行します。

### 実行方法（ローカル）

以下のコマンドを実行すると、前日のレコードが削除されます。

```bash
npx ts-node --esm -P tsconfig.batch.json ./batch/index.ts
```
GitHub Actions の設定は`.github/workflows/cleanup.yml`に記載。

## テスト内容の例
### 名刺カードページ
- 名前が表示される
- 自己紹介が表示される
- 技術タグが表示される
- GitHub / Qiita / X のアイコンリンクが表示される
- 戻るボタンでホームに戻れる

### 登録ページ
- 必須バリデーション（ID/名前/スキル）
- 任意項目（GitHub, Qiita, X ID）は未入力でも登録可能
- 登録後 /cards/:id に遷移

### ホームページ
- IDを入力して「名刺を見る」で遷移
- ID未入力や存在しない場合はエラー表示
- 「名刺を登録する」リンクで登録ページへ遷移

## 今後について
skills テーブルはユーザー自身に使用技術を登録させられるようにしたい。<br>
現状は React, TypeScript, Github の３つだけ。
