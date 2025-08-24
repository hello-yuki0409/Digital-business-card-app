import { Box, Code, Text } from "@chakra-ui/react";

type Props = {
  id: string;
};

export const IdDisplay = ({ id }: Props) => {
  return (
    <Box p={4} borderWidth="1px" borderRadius="md">
      <Text fontSize="md">URLから取得したIDは:</Text>

      <Code fontSize="xl" colorScheme="teal" p={2} borderRadius="md">
        {id}
      </Code>
    </Box>
  );
};
