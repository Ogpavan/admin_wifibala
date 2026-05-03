import { Box, Button, Text, VStack } from '@chakra-ui/react';

export default function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <Box bg="white" borderWidth="1px" borderRadius="lg" p={8}>
      <VStack spacing={3}>
        <Text fontWeight="700">{title}</Text>
        <Text color="gray.500" textAlign="center">{description}</Text>
        {actionLabel ? <Button onClick={onAction}>{actionLabel}</Button> : null}
      </VStack>
    </Box>
  );
}
