import { Flex, Heading, Text } from '@chakra-ui/react';

export default function PageHeader({ title, subtitle, actions }) {
  return (
    <Flex justify="space-between" align={{ base: 'start', md: 'center' }} mb={5} direction={{ base: 'column', md: 'row' }} gap={3}>
      <div>
        <Heading size="md">{title}</Heading>
        {subtitle ? <Text color="gray.500">{subtitle}</Text> : null}
      </div>
      {actions}
    </Flex>
  );
}
