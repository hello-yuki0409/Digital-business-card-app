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
  Button,
} from "@chakra-ui/react";

export const CardDetailPage = () => {
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
      <Center minH="100dvh" bg="brand.50">
        <VStack spacing={3}>
          <Spinner
            size="lg"
            thickness="3px"
            speed="0.6s"
            color="brand.500"
            emptyColor="white"
          />
          <Text fontSize="sm" color="brand.700">
            ユーザー情報を取得中…
          </Text>
        </VStack>
      </Center>
    );
  }

  // ここに来るのは user がある場合のみ（仕様のため）
  return (
    <Center minH="100dvh" bg="brand.50" p={4}>
      <VStack
        spacing={5}
        w="100%"
        maxW="360px"
        bg="white"
        border="1px solid"
        borderColor="brand.200"
        borderRadius="2xl"
        boxShadow="soft"
        p={5}
        align="stretch"
      >
        {/* 名前 */}
        <Heading size="md" textAlign="center" color="brand.600">
          {user?.name}
        </Heading>

        {/* 紹介 */}
        <Box>
          <Heading size="sm" mb={2} color="brand.500">
            紹介
          </Heading>
          <Divider mb={3} borderColor="brand.200" />
          <Box
            fontSize="sm"
            color="gray.700"
            dangerouslySetInnerHTML={{ __html: user?.description ?? "" }}
          />
        </Box>

        {/* Skills */}
        {user?.skills?.length ? (
          <Box>
            <Heading size="sm" mb={2} color="brand.500">
              Skills
            </Heading>
            <Divider mb={3} borderColor="brand.200" />
            <HStack wrap="wrap" spacing={2}>
              {user.skills.map((s) => (
                <Tag key={s.id} size="sm" variant="soft" px={3} py={1}>
                  {s.name}
                </Tag>
              ))}
            </HStack>
          </Box>
        ) : null}

        {/* Links */}
        {(user?.github_id || user?.qiita_id || user?.x_id) && (
          <Box>
            <Heading size="sm" mb={2} color="brand.500">
              Links
            </Heading>
            <Divider mb={3} borderColor="brand.200" />
            <VStack align="stretch" spacing={2}>
              {user.github_id && (
                <Button
                  as={Link}
                  href={user.github_id}
                  isExternal
                  variant="soft"
                >
                  GitHub
                </Button>
              )}
              {user.qiita_id && (
                <Button
                  as={Link}
                  href={user.qiita_id}
                  isExternal
                  variant="soft"
                >
                  Qiita
                </Button>
              )}
              {user.x_id && (
                <Button as={Link} href={user.x_id} isExternal variant="soft">
                  X (Twitter)
                </Button>
              )}
            </VStack>
          </Box>
        )}
      </VStack>
    </Center>
  );
};
