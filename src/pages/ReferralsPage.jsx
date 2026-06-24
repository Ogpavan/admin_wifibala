import {
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  SimpleGrid,
  Switch,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import PageHeader from '../components/common/PageHeader';
import LoadingState from '../components/common/LoadingState';
import { getReferralOverview, updateReferralSettings } from '../services/referralsApi';

export default function ReferralsPage() {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [overview, setOverview] = useState(null);
  const [form, setForm] = useState({
    reward_amount: '0',
    is_enabled: true,
  });

  useEffect(() => {
    const loadOverview = async () => {
      try {
        setIsLoading(true);
        const data = await getReferralOverview();
        setOverview(data);
        setForm({
          reward_amount: String(data.settings?.reward_amount ?? 0),
          is_enabled: Boolean(data.settings?.is_enabled ?? true),
        });
      } catch (error) {
        toast({
          title: 'Failed to load referral data',
          description: error.message,
          status: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadOverview();
  }, [toast]);

  const onSave = async () => {
    try {
      setIsSaving(true);
      const data = await updateReferralSettings({
        reward_amount: form.reward_amount,
        is_enabled: form.is_enabled,
      });
      toast({ title: 'Referral settings updated', status: 'success' });
      setOverview((prev) => (prev ? { ...prev, settings: data.settings } : prev));
      setForm({
        reward_amount: String(data.settings?.reward_amount ?? 0),
        is_enabled: Boolean(data.settings?.is_enabled ?? true),
      });
    } catch (error) {
      toast({
        title: 'Failed to save referral settings',
        description: error.message,
        status: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingState text="Loading referral settings..." />;
  }

  const summary = overview?.summary || {};
  const rewards = overview?.rewards || [];
  const users = overview?.users || [];

  return (
    <>
      <PageHeader
        title="Referrals"
        subtitle="Manage referral rewards and review usage."
      />

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={5}>
        <Box bg="white" borderWidth="1px" borderRadius="lg" p={4}>
          <Text color="gray.500" fontSize="sm">Reward Amount</Text>
          <Text fontSize="2xl" fontWeight="bold">₹{Number(form.reward_amount || 0).toFixed(2)}</Text>
        </Box>
        <Box bg="white" borderWidth="1px" borderRadius="lg" p={4}>
          <Text color="gray.500" fontSize="sm">Referred Users</Text>
          <Text fontSize="2xl" fontWeight="bold">{summary.referred_users || 0}</Text>
        </Box>
        <Box bg="white" borderWidth="1px" borderRadius="lg" p={4}>
          <Text color="gray.500" fontSize="sm">Reward Logs</Text>
          <Text fontSize="2xl" fontWeight="bold">{rewards.length}</Text>
        </Box>
      </SimpleGrid>

      <Box bg="white" borderWidth="1px" borderRadius="lg" p={5} mb={5}>
        <VStack spacing={4} align="stretch">
          <FormControl display="flex" alignItems="center" justifyContent="space-between">
            <FormLabel mb="0">Enable referral rewards</FormLabel>
            <Switch
              isChecked={form.is_enabled}
              onChange={(e) => setForm((prev) => ({ ...prev, is_enabled: e.target.checked }))}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Reward amount per referral</FormLabel>
            <Input
              type="number"
              min="0"
              step="1"
              value={form.reward_amount}
              onChange={(e) => setForm((prev) => ({ ...prev, reward_amount: e.target.value }))}
            />
          </FormControl>

          <HStack justify="end">
            <Button onClick={onSave} isLoading={isSaving} colorScheme="blue">
              Save Referral Settings
            </Button>
          </HStack>
        </VStack>
      </Box>

      <Box bg="white" borderWidth="1px" borderRadius="lg" overflow="hidden" mb={5}>
        <Box p={4} borderBottomWidth="1px">
          <Text fontSize="lg" fontWeight="semibold">Recent Referral Rewards</Text>
        </Box>
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th>Referrer</Th>
                <Th>Referred User</Th>
                <Th>Code</Th>
                <Th isNumeric>Amount</Th>
                <Th>Created</Th>
              </Tr>
            </Thead>
            <Tbody>
              {rewards.length ? rewards.map((item) => (
                <Tr key={item.id}>
                  <Td>
                    <Text fontWeight="medium">{item.referrer_name}</Text>
                    <Text fontSize="sm" color="gray.500">{item.referrer_mobile}</Text>
                  </Td>
                  <Td>
                    <Text fontWeight="medium">{item.referred_name}</Text>
                    <Text fontSize="sm" color="gray.500">{item.referred_mobile}</Text>
                  </Td>
                  <Td>{item.referral_code}</Td>
                  <Td isNumeric>₹{Number(item.reward_amount || 0).toFixed(2)}</Td>
                  <Td>{item.created_at ? new Date(item.created_at).toLocaleString() : '-'}</Td>
                </Tr>
              )) : (
                <Tr>
                  <Td colSpan={5}>
                    <Text color="gray.500" py={4} textAlign="center">
                      No referral rewards yet.
                    </Text>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>
      </Box>

      <Box bg="white" borderWidth="1px" borderRadius="lg" overflow="hidden">
        <Box p={4} borderBottomWidth="1px">
          <Text fontSize="lg" fontWeight="semibold">Registered Referral Codes</Text>
        </Box>
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th>User</Th>
                <Th>Code</Th>
                <Th>Referred By</Th>
                <Th>Wallet</Th>
              </Tr>
            </Thead>
            <Tbody>
              {users.length ? users.map((item) => {
                const referredBy = users.find((user) => user.user_id === item.referred_by_user_id);
                return (
                  <Tr key={item.user_id}>
                    <Td>
                      <Text fontWeight="medium">{item.name}</Text>
                      <Text fontSize="sm" color="gray.500">{item.phone_number}</Text>
                    </Td>
                    <Td>{item.referral_code || '-'}</Td>
                    <Td>{referredBy?.name || '-'}</Td>
                    <Td>₹{Number(item.wallet || 0).toFixed(2)}</Td>
                  </Tr>
                );
              }) : (
                <Tr>
                  <Td colSpan={4}>
                    <Text color="gray.500" py={4} textAlign="center">
                      No users found.
                    </Text>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>
      </Box>
    </>
  );
}
