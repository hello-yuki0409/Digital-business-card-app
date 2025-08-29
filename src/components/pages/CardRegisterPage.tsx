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
  FormErrorMessage,
} from "@chakra-ui/react";
import { supabase } from "../../lib/supabase";
import { useForm, Controller } from "react-hook-form";

type Skill = { id: number; name: string };

type FormValues = {
  userId: string;
  name: string;
  description: string;
  githubId?: string;
  qiitaId?: string;
  xId?: string;
  selectedSkillIds: string[];
};

export const CardRegisterPage = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
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

  const {
    register, // input/textarea などのバインド
    handleSubmit, // 送信ハンドラをラップ
    control, // Controller 用（CheckboxGroup など）
    formState: { errors }, // バリデーション結果（各フィールドのエラー）
  } = useForm<FormValues>({
    defaultValues: {
      userId: "",
      name: "",
      description: "",
      githubId: "",
      qiitaId: "",
      xId: "",
      selectedSkillIds: [], // 最初は未選択
    },
    mode: "onBlur", // 失焦点時にバリデーション（好みで onChange / onSubmit に変更可）
  });

  // 送信（今回はバリデーション確認だけ。次フェーズで Supabase へ insert）
  const onSubmit = (values: FormValues) => {
    console.log("OK form values:", values);
  };

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
        as="form"
        onSubmit={handleSubmit(onSubmit)}
        spacing={{ base: 4, md: 5 }}
        align="stretch"
        bg="white"
        p={{ base: 4, md: 6 }}
        border="1px solid"
        borderColor="brand.200"
        borderRadius="2xl"
        boxShadow="soft"
      >
        <FormControl isInvalid={!!errors.userId}>
          <FormLabel>ID（この ID で名刺ページにアクセスできます）</FormLabel>
          <Input
            // register で必須＆パターン（英字のみ）を設定
            {...register("userId", {
              required: "IDは必須です",
              pattern: {
                value: /^[A-Za-z]+$/, // ← 英語文字列だけ
                message: "IDは英字（A–Z, a–z）のみ使用できます",
              },
              minLength: { value: 3, message: "3文字以上で入力してください" },
              maxLength: { value: 32, message: "32文字以内で入力してください" },
            })}
          />
          <FormErrorMessage>{errors.userId?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.name}>
          <FormLabel>名前</FormLabel>
          <Input
            placeholder="例: 山田太郎"
            {...register("name", { required: "名前は必須です" })}
          />
          <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.name}>
          <FormLabel>自己紹介</FormLabel>
          <Textarea
            placeholder="自己紹介を入力してください（HTML可）"
            {...register("description")}
          />
          <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.selectedSkillIds}>
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
              {/* CheckboxGroup は Controller でつなぐ.  ココ */}
              <Controller
                control={control}
                name="selectedSkillIds"
                rules={{
                  validate: (v) =>
                    v && v.length > 0 ? true : "最低1つは選択してください",
                }}
                render={({ field }) => (
                  // field.value: string[] / field.onChange: (next: any) => void
                  <CheckboxGroup value={field.value} onChange={field.onChange}>
                    <Stack direction="row" flexWrap="wrap" spacing={4}>
                      {skills.map((s) => (
                        <Checkbox key={s.id} value={String(s.id)}>
                          {s.name}
                        </Checkbox>
                      ))}
                    </Stack>
                  </CheckboxGroup>
                )}
              />
            </>
          )}
          <FormErrorMessage>
            {errors.selectedSkillIds?.message as string}
          </FormErrorMessage>
        </FormControl>

        <FormControl>
          <FormLabel>GitHub ID</FormLabel>
          <Input placeholder="例: your-github-id" {...register("githubId")} />
        </FormControl>

        <FormControl>
          <FormLabel>Qiita ID</FormLabel>
          <Input placeholder="例: your-qiita-id" {...register("qiitaId")} />
        </FormControl>

        <FormControl>
          <FormLabel>X (Twitter) ID</FormLabel>
          <Input placeholder="例: your-x-id" {...register("xId")} />
        </FormControl>

        <Box textAlign="center" pt={2}>
          <Button type="submit" size="lg" variant="soft">
            登録
          </Button>
        </Box>
      </VStack>
    </Container>
  );
};
