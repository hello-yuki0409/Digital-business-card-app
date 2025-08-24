import { Routes, Route, Link as RouterLink } from "react-router-dom";
import { Home } from "./components/pages/Home";
import { About } from "./components/pages/About";
import { CardDetailPage } from "./components/pages/CardDetailPage";
import { Box, Flex, Link, Spacer, Heading } from "@chakra-ui/react";

export default function App() {
  return (
    <Box p={4}>
      {/* ナビゲーションヘッダー (省略) */}
      <Flex
        as="nav"
        bg="teal.500"
        color="white"
        p={4}
        borderRadius="md"
        alignItems="center"
      >
        <Heading size="md">React Router Demo</Heading>
        <Spacer />
        <Link as={RouterLink} to="/" mr={4}>
          ホーム
        </Link>
        <Link as={RouterLink} to="/about" mr={4}>
          概要
        </Link>
        {/* テスト用のリンクを追加 */}
        <Link as={RouterLink} to="/cards/hello-world">
          カード詳細へ
        </Link>
      </Flex>

      <Box mt={8}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          {/* 👇 この行を追加 */}
          <Route path="/cards/:id" element={<CardDetailPage />} />
        </Routes>
      </Box>
    </Box>
  );
}
