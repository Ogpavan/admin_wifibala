import { Center, Spinner, Text, VStack } from '@chakra-ui/react';

export default function LoadingState({ text = 'Loading...' }) {
  return (
    <Center py={12}>
      <VStack>
        <Spinner size="lg" color="brand.500" />
        <Text color="gray.500">{text}</Text>
      </VStack>
    </Center>
  );
}
