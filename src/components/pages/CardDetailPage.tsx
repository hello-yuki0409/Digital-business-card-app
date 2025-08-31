import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  Text,
  Divider,
  Button,
  Tooltip,
  IconButton,
} from "@chakra-ui/react";
import { FaGithub, FaXTwitter } from "react-icons/fa6";
import { SiQiita } from "react-icons/si";

export const CardDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // idがundefined、あるいはユーザーが見つからない場合はローディングのまま
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
            自己紹介
          </Heading>
          <Divider mb={3} borderColor="brand.200" />
          <Box
            fontSize="sm"
            color="gray.700"
            dangerouslySetInnerHTML={{ __html: user?.description ?? "" }}
          />
        </Box>

        {/* 好きな技術 */}
        {user?.skills?.length ? (
          <Box>
            <Heading size="sm" mb={2} color="brand.500">
              好きな技術
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
            <Heading size="sm" mb={1} color="brand.500">
              Links
            </Heading>
            <Divider mb={2} borderColor="brand.200" />

            <HStack spacing={4}>
              {user.github_id && (
                <Tooltip label="GitHub">
                  <IconButton
                    as="a"
                    href={user.github_id}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub"
                    icon={<FaGithub />}
                    variant="ghost"
                    fontSize="24px"
                  />
                </Tooltip>
              )}
              {user.qiita_id && (
                <Tooltip label="Qiita">
                  <IconButton
                    as="a"
                    href={user.qiita_id}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Qiita"
                    icon={<SiQiita />}
                    variant="ghost"
                    fontSize="24px"
                  />
                </Tooltip>
              )}
              {user.x_id && (
                <Tooltip label="X (Twitter)">
                  <IconButton
                    as="a"
                    href={user.x_id}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="X (Twitter)"
                    icon={<FaXTwitter />}
                    variant="ghost"
                    fontSize="24px"
                  />
                </Tooltip>
              )}
            </HStack>
          </Box>
        )}
        <Box pt={2} textAlign="center">
          <Button variant="soft" onClick={() => navigate("/")}>
            ホームに戻る
          </Button>
        </Box>
      </VStack>
    </Center>
  );
};
