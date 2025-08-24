import { Heading, VStack } from "@chakra-ui/react";
import { IdDisplay } from "../atoms/IdDisplay";

type Props = {
  cardId: string;
};

export const CardDetail = ({ cardId }: Props) => {
  return (
    <VStack spacing={4} align="stretch">
      <Heading size="lg">カード詳細</Heading>
      {/* AtomコンポーネントにIDを渡して表示 */}
      <IdDisplay id={cardId} />
    </VStack>
  );
};
