import { useCallback, useEffect, memo, useMemo, useState } from "react";
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
  Spinner,
  FormErrorMessage,
  useToast,
} from "@chakra-ui/react";
import { supabase } from "../../lib/supabase";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";

type Skill = { id: number; name: string };

type SkillCheckboxListProps = {
  skills: Skill[];
  value: string[]; // Controller から渡る
  onChange: (next: string[] | number[]) => void;
};

const SkillCheckboxList = memo(function SkillCheckboxList({
  skills,
  value,
  onChange,
}: SkillCheckboxListProps) {
  const items = useMemo(
    () =>
      skills.map((s) => (
        <Checkbox key={s.id} value={String(s.id)}>
          {s.name}
        </Checkbox>
      )),
    [skills]
  );

  return (
    <CheckboxGroup value={value} onChange={onChange}>
      <Stack direction="row" flexWrap="wrap" spacing={4}>
        {items}
      </Stack>
    </CheckboxGroup>
  );
});

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

  const defaultValues = useMemo(
    () => ({
      userId: "",
      name: "",
      description: "",
      githubId: "",
      qiitaId: "",
      xId: "",
      selectedSkillIds: [] as string[],
    }),
    []
  );

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues, mode: "onBlur" });

  const toast = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = useCallback(
    async (values: FormValues) => {
      try {
        setSubmitting(true);
        const { data: existing, error: findErr } = await supabase
          .from("users")
          .select("id")
          .eq("id", values.userId)
          .maybeSingle();
        if (findErr) throw findErr;
        if (existing) {
          setError("userId", { message: "このIDはすでに使用されています" });
          toast({ title: "IDが使われています", status: "error" });
          return;
        }

        const { error: userErr } = await supabase.from("users").insert([
          {
            id: values.userId,
            name: values.name,
            description: values.description,
            github_id: values.githubId || null,
            qiita_id: values.qiitaId || null,
            x_id: values.xId || null,
          },
        ]);
        if (userErr) throw userErr;

        if (values.selectedSkillIds.length > 0) {
          const rows = values.selectedSkillIds.map((sid) => ({
            user_id: values.userId,
            skill_id: Number(sid), // DBはintなのでここでだけnumberに変換
          }));
          const { error: linkErr } = await supabase
            .from("user_skill")
            .insert(rows);
          if (linkErr) throw linkErr;
        }

        toast({ title: "登録しました", status: "success" });
        navigate(`/cards/${values.userId}`);
      } catch (e: unknown) {
        if (e instanceof Error) {
          console.error(e.message);
          toast({
            title: "登録に失敗しました",
            description: e.message,
            status: "error",
          });
        } else {
          console.error("Unknown error", e);
          toast({
            title: "登録に失敗しました",
            description: "不明なエラーが発生しました",
            status: "error",
          });
        }
      } finally {
        setSubmitting(false);
      }
    },
    [navigate, setError, toast]
  );

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
            placeholder="ID は半角英字で入力してください"
            {...register("userId", {
              required: "IDは必須です",
              pattern: {
                value: /^[A-Za-z]+$/,
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

        <FormControl>
          <FormLabel>自己紹介</FormLabel>
          <Textarea
            placeholder="自己紹介を入力してください（HTML可）"
            {...register("description")}
          />
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
              {/* CheckboxGroup は特殊だから Controller で繋ぐらしい */}
              <Controller
                control={control}
                name="selectedSkillIds"
                rules={{
                  validate: (v) =>
                    v && v.length > 0 ? true : "1つは選択してください",
                }}
                render={({ field }) =>
                  loadingSkills ? (
                    <Box py={3}>
                      <Spinner size="sm" mr={2} color="brand.500" />
                      <Text as="span" fontSize="sm" color="gray.600">
                        技術一覧を読み込み中…
                      </Text>
                    </Box>
                  ) : (
                    <>
                      <SkillCheckboxList
                        skills={skills}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </>
                  )
                }
              />
            </>
          )}
          <FormErrorMessage>
            {errors.selectedSkillIds?.message as string}
          </FormErrorMessage>
        </FormControl>

        <FormControl>
          <FormLabel>GitHub ID</FormLabel>
          <Input placeholder="例: hello-yuki0409" {...register("githubId")} />
        </FormControl>

        <FormControl>
          <FormLabel>Qiita ID</FormLabel>
          <Input placeholder="例: Uyuki_0409" {...register("qiitaId")} />
        </FormControl>

        <FormControl>
          <FormLabel>X (Twitter) ID</FormLabel>
          <Input placeholder="例: weblogv2" {...register("xId")} />
        </FormControl>

        <Box textAlign="center" pt={2}>
          <Button type="submit" size="lg" variant="soft" isLoading={submitting}>
            登録
          </Button>
        </Box>
      </VStack>
    </Container>
  );
};
