import { Box, HStack, Icon, Stat, StatHelpText, StatLabel, StatNumber } from '@chakra-ui/react';

export default function StatCard({ label, value, helpText, icon }) {
  return (
    <Box bg="white" p={4} borderRadius="lg" borderWidth="1px" boxShadow="sm">
      <HStack justify="space-between" align="start">
        <Stat>
          <StatLabel color="gray.500">{label}</StatLabel>
          <StatNumber>{value}</StatNumber>
          <StatHelpText mb={0}>{helpText}</StatHelpText>
        </Stat>
        {icon ? <Icon as={icon} boxSize={6} color="brand.500" /> : null}
      </HStack>
    </Box>
  );
}
