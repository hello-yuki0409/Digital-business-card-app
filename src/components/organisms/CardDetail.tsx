import { type User } from "../../types/user";
import { Box, VStack, Heading, Link, HStack, Icon } from "@chakra-ui/react";
import { FaGithub, FaPen, FaTwitter } from "react-icons/fa"; // SNSアイコン用のライブラリ

// SNSのIDから完全なURLを生成するヘルパー関数
const createSnsUrl = (
  service: "github" | "qiita" | "x",
  id: string
): string => {
  switch (service) {
    case "github":
      return `https://github.com/${id}`;
    case "qiita":
      return `https://qiita.com/${id}`;
    case "x":
      return `https://twitter.com/${id}`;
  }
};

type Props = {
  user: User;
};

export const CardDetail = ({ user }: Props) => {
  return (
    // スマホ画面を想定し、中央に最大幅400pxのコンテナを配置
    <Box maxW="400px" mx="auto" p={4} borderWidth="1px" borderRadius="lg">
      <VStack spacing={4} align="stretch">
        {/* ユーザー名 */}
        <Heading as="h1" size="lg" textAlign="center">
          {user.name}
        </Heading>

        {/* SNSリンク */}
        <HStack justify="center" spacing={4}>
          {user.github_id && (
            <Link href={createSnsUrl("github", user.github_id)} isExternal>
              <Icon as={FaGithub} w={6} h={6} />
            </Link>
          )}
          {user.qiita_id && (
            <Link href={createSnsUrl("qiita", user.qiita_id)} isExternal>
              <Icon as={FaPen} w={6} h={6} />
            </Link>
          )}
          {user.x_id && (
            <Link href={createSnsUrl("x", user.x_id)} isExternal>
              <Icon as={FaTwitter} w={6} h={6} />
            </Link>
          )}
        </HStack>

        {/* 紹介文 */}
        <Box>
          <Heading as="h2" size="md" mb={2}>
            自己紹介
          </Heading>
          {/* HTMLをそのまま表示 (セキュリティリスクに注意) */}
          <Box dangerouslySetInnerHTML={{ __html: user.description }} />
        </Box>
      </VStack>
    </Box>
  );
};
