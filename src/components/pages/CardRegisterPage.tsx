import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  Heading,
  Checkbox,
  CheckboxGroup,
  Stack,
  Text,
  Divider,
  Spinner,
} from "@chakra-ui/react";
import { supabase } from "../../lib/supabase"; // skills を取得するために利用

// Supabase skills テーブルの最小型
type Skill = { id: number; name: string };

export const CardRegisterPage = () => {
  // ---------------- フォーム見た目用のローカル状態（あとで react-hook-form に差し替え予定） ----------------
  const [userId, setUserId] = useState(""); // 英単語ID
  const [name, setName] = useState(""); // ユーザー名
  const [description, setDescription] = useState(""); // 自己紹介(HTML想定)
  const [githubId, setGithubId] = useState("");
  const [qiitaId, setQiitaId] = useState("");
  const [xId, setXId] = useState("");

  // ---------------- skills 選択（複数選択） ----------------
  const [skills, setSkills] = useState<Skill[]>([]); // Supabaseから取得する一覧
  const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>([]); // 選択された skill_id 群
  const [loadingSkills, setLoadingSkills] = useState(true); // 技術一覧の読込状態

  // 初回マウント時に skills テーブルを読み込む
  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoadingSkills(true);
      const { data, error } = await supabase
        .from("skills")
        .select("id, name")
        .order("id", { ascending: true });
      if (!ignore) {
        if (!error && data) setSkills(data as Skill[]);
        setLoadingSkills(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    // Container: 中央寄せ + レスポンシブ。スマホはほぼ全幅、PCは最大幅 "md"
    <Container maxW="md" py={{ base: 6, md: 10 }}>
      {/* タイトル */}
      <Heading
        mb={{ base: 4, md: 6 }}
        textAlign="center"
        size="lg"
        color="brand.600"
      >
        名刺新規登録
      </Heading>

      {/* 説明テキスト（IDポリシーの補足） */}
      <Text fontSize="sm" color="gray.600" textAlign="center" mb={4}>
        ID は英単語で入力してください（例: <code>sample_id</code>）。この ID
        で名刺ページにアクセスできます。
      </Text>

      {/* フォームの各行を縦並びで配置。spacing が行間、align="stretch" で各行を横幅いっぱいに。 */}
      <VStack
        spacing={{ base: 4, md: 5 }}
        align="stretch"
        bg="white"
        p={{ base: 4, md: 6 }}
        border="1px solid"
        borderColor="brand.200"
        borderRadius="2xl"
        boxShadow="soft"
      >
        {/* ID（英単語） */}
        <FormControl>
          {/* ラベル */}
          <FormLabel>ID（英単語）</FormLabel>
          {/* 入力欄：見た目だけ。後で react-hook-form の register に置き換え予定 */}
          <Input
            placeholder="例: hello-card"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </FormControl>

        {/* 名前 */}
        <FormControl>
          <FormLabel>名前</FormLabel>
          <Input
            placeholder="例: 山田太郎"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </FormControl>

        {/* 自己紹介（HTML可・今回のサンプルはそのまま描画前提） */}
        <FormControl>
          <FormLabel>自己紹介</FormLabel>
          <Textarea
            placeholder="自己紹介を入力してください（HTML可）"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
          />
        </FormControl>

        {/* 好きな技術（skillsテーブルから取得・複数選択） */}
        <FormControl>
          <FormLabel>好きな技術（複数選択可）</FormLabel>

          {/* 読み込み中はスピナーを表示 */}
          {loadingSkills ? (
            <Box py={3}>
              <Spinner size="sm" mr={2} color="brand.500" />
              <Text as="span" fontSize="sm" color="gray.600">
                技術一覧を読み込み中…
              </Text>
            </Box>
          ) : (
            <>
              <Divider mb={3} borderColor="brand.200" />
              {/* CheckboxGroup: Chakra の Select は multiple が弱いので、複数選択はチェックボックス推奨 */}
              <CheckboxGroup
                // value は string[] でも number[] でもOK。ここでは number[] を使用。
                value={selectedSkillIds}
                onChange={(vals) => {
                  // onChange は (string[] | number[]) が来るので number[] に寄せる
                  const ids = (vals as (string | number)[]).map((v) =>
                    Number(v)
                  );
                  setSelectedSkillIds(ids);
                }}
              >
                {/* Stack: 横一列（wrap）→ 画面幅が狭いとき自動改行。レスポンシブで余白も自動調整 */}
                <Stack direction="row" flexWrap="wrap" spacing={4}>
                  {skills.map((s) => (
                    <Checkbox key={s.id} value={s.id}>
                      {s.name}
                    </Checkbox>
                  ))}
                </Stack>
              </CheckboxGroup>
            </>
          )}
        </FormControl>

        {/* Github / Qiita / X */}
        <FormControl>
          <FormLabel>GitHub ID</FormLabel>
          <Input
            placeholder="例: your-github-id"
            value={githubId}
            onChange={(e) => setGithubId(e.target.value)}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Qiita ID</FormLabel>
          <Input
            placeholder="例: your-qiita-id"
            value={qiitaId}
            onChange={(e) => setQiitaId(e.target.value)}
          />
        </FormControl>

        <FormControl>
          <FormLabel>X (Twitter) ID</FormLabel>
          <Input
            placeholder="例: your-x-id"
            value={xId}
            onChange={(e) => setXId(e.target.value)}
          />
        </FormControl>

        {/* 送信ボタン（この段階では押しても何もしない。次の工程で react-hook-form + Supabase 登録へ） */}
        <Box textAlign="center" pt={2}>
          <Button size="lg" variant="soft">
            登録
          </Button>
        </Box>
      </VStack>
    </Container>
  );
};
