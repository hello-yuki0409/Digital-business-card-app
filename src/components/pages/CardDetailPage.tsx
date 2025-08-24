import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchUserWithSkills } from "../../lib/user";
import type { User } from "../../types/user";
import {
  Box,
  Center,
  Spinner,
  VStack,
  Heading,
  Tag,
  HStack,
  Link,
  Text,
  Divider,
} from "@chakra-ui/react";

export default function CardDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 仕様：idがundefined、あるいはユーザーが見つからない場合はローディングのまま
  useEffect(() => {
    let ignore = false;
    async function run() {
      if (!id) {
        setLoading(true);
        return;
      }
      setLoading(true);
      const u = await fetchUserWithSkills(id);
      if (!ignore) {
        setUser(u);
        // 見つからなくてもロード中継続（仕様準拠）
        if (u) setLoading(false);
      }
    }
    run();
    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) {
    return (
      <Center minH="100dvh">
        <VStack spacing={3}>
          <Spinner size="lg" />
          <Text fontSize="sm" color="gray.500">
            ユーザー情報を取得中…
          </Text>
        </VStack>
      </Center>
    );
  }

  // ここに来るのは user がある場合のみ（仕様のため）
  return (
    <Center minH="100dvh" bg="gray.50" p={4}>
      <VStack
        spacing={4}
        w="100%"
        maxW="360px" // iPhone SE 幅想定
        bg="white"
        borderRadius="2xl"
        boxShadow="md"
        p={4}
        align="stretch"
      >
        <Heading size="md" textAlign="center">
          {user?.name}
        </Heading>

        {/* 紹介文（HTMLをそのまま表示：注意！） */}
        <Box>
          <Heading size="sm" mb={1}>
            紹介
          </Heading>
          <Divider mb={2} />
          <Box
            fontSize="sm"
            sx={{ "& p": { marginBottom: "0.5rem" } }}
            dangerouslySetInnerHTML={{ __html: user?.description ?? "" }}
          />
        </Box>

        {/* Skills */}
        {user?.skills?.length ? (
          <Box>
            <Heading size="sm" mb={1}>
              Skills
            </Heading>
            <Divider mb={2} />
            <HStack wrap="wrap" spacing={2}>
              {user.skills.map((s) => (
                <Tag key={s.id} size="sm">
                  {s.name}
                </Tag>
              ))}
            </HStack>
          </Box>
        ) : null}

        {/* SNS（任意登録：あるものだけ） */}
        {(user?.github_id || user?.qiita_id || user?.x_id) && (
          <Box>
            <Heading size="sm" mb={1}>
              Links
            </Heading>
            <Divider mb={2} />
            <VStack align="start" spacing={1}>
              {user.github_id && (
                <Link href={user.github_id} isExternal>
                  GitHub
                </Link>
              )}
              {user.qiita_id && (
                <Link href={user.qiita_id} isExternal>
                  Qiita
                </Link>
              )}
              {user.x_id && (
                <Link href={user.x_id} isExternal>
                  X (Twitter)
                </Link>
              )}
            </VStack>
          </Box>
        )}
      </VStack>
    </Center>
  );
}
