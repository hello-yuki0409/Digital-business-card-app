import {
  Button,
  Container,
  FormLabel,
  Heading,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";

export const HomePage = () => {
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
      <VStack
        as="form"
        spacing={{ base: 4, md: 5 }}
        align="stretch"
        bg="white"
        p={{ base: 4, md: 6 }}
        border="1px solid"
        borderColor="brand.200"
        borderRadius="2xl"
        boxShadow="soft"
      >
        <FormLabel mb="-5.5">ID</FormLabel>
        <Input placeholder="設定したIDを入力" />
        <Button type="submit" size="lg" variant="soft">
          名刺を見る
        </Button>

        {/* 後で Register にリンクつける */}
        <Text fontSize="sm" color="gray.600" textAlign="center" mb={4}>
          名刺を登録する
        </Text>
      </VStack>
    </Container>
  );
};
