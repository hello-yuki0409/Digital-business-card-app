import {
  Button,
  Container,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Text,
  VStack,
  Link,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export const HomePage = () => {
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = id.trim();

    if (!trimmed) {
      setError("IDを入力してください");
      return;
    }

    setError("");
    setLoading(true);

    // --- Supabase で存在チェック ---
    const { data, error: dbErr } = await supabase
      .from("users")
      .select("id")
      .eq("id", trimmed)
      .maybeSingle();

    setLoading(false);

    if (dbErr) {
      console.error(dbErr);
      setError("サーバーエラーが発生しました");
      return;
    }

    if (!data) {
      setError("このIDは存在しません");
      return;
    }

    // 存在した場合だけ遷移
    navigate(`/cards/${trimmed}`);
  };

  return (
    <Container maxW="md" py={{ base: 6, md: 10 }}>
      <Heading
        mb={{ base: 4, md: 6 }}
        textAlign="center"
        size="lg"
        color="brand.600"
      >
        デジタル名刺アプリ
      </Heading>
      <form onSubmit={onSubmit}>
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
          <FormControl isInvalid={!!error}>
            <FormLabel>ID</FormLabel>
            <Input
              placeholder="設定したIDを入力"
              value={id}
              onChange={(e) => {
                setId(e.target.value);
                if (error) setError("");
              }}
              autoComplete="off"
            />
            <FormErrorMessage>{error}</FormErrorMessage>
          </FormControl>
          <Button
            type="submit"
            size="lg"
            variant="soft"
            isDisabled={!id.trim()}
            isLoading={loading}
          >
            名刺を見る
          </Button>

          <Text fontSize="sm" color="gray.600" textAlign="center" mb={0}>
            <Link as={RouterLink} to="/cards/register" color="brand.700">
              名刺を登録する
            </Link>
          </Text>
        </VStack>
      </form>
    </Container>
  );
};
