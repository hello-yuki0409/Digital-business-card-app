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
import { supabase } from "../../lib/supabase";

type Skill = { id: number; name: string };

export const CardRegisterPage = () => {
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [githubId, setGithubId] = useState("");
  const [qiitaId, setQiitaId] = useState("");
  const [xId, setXId] = useState("");

  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(true);

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
    <Container maxW="md" py={{ base: 6, md: 10 }}>
      <Heading
        mb={{ base: 4, md: 6 }}
        textAlign="center"
        size="lg"
        color="brand.600"
      >
        名刺新規登録
      </Heading>

      <Text fontSize="sm" color="gray.600" textAlign="center" mb={4}>
        ID は英単語で入力してください
      </Text>

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
        <FormControl>
          <FormLabel>ID（この ID で名刺ページにアクセスできます）</FormLabel>
          <Input
            placeholder="例: hello-card"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </FormControl>

        <FormControl>
          <FormLabel>名前</FormLabel>
          <Input
            placeholder="例: 山田太郎"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </FormControl>

        <FormControl>
          <FormLabel>自己紹介</FormLabel>
          <Textarea
            placeholder="自己紹介を入力してください（HTML可）"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
          />
        </FormControl>

        <FormControl>
          <FormLabel>好きな技術（複数選択可）</FormLabel>

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
              <CheckboxGroup
                value={selectedSkillIds}
                onChange={(vals) => setSelectedSkillIds(vals as string[])}
              >
                <Stack direction="row" flexWrap="wrap" spacing={4}>
                  {skills.map((s) => (
                    <Checkbox key={s.id} value={String(s.id)}>
                      {s.name}
                    </Checkbox>
                  ))}
                </Stack>
              </CheckboxGroup>
            </>
          )}
        </FormControl>

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

        <Box textAlign="center" pt={2}>
          <Button size="lg" variant="soft">
            登録
          </Button>
        </Box>
      </VStack>
    </Container>
  );
};
