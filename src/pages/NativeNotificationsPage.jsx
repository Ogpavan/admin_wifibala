import {
  Badge,
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Image,
  Input,
  Select,
  SimpleGrid,
  Table,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { FiImage, FiSend, FiX } from 'react-icons/fi';
import LoadingState from '../components/common/LoadingState';
import PageHeader from '../components/common/PageHeader';
import {
  getNativeNotificationHistory,
  getNativeNotificationStats,
  getNativeNotificationUsers,
  sendNativeNotification,
} from '../services/nativeNotificationsApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.askcollege.in';

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
}

function mediaUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}${path}`;
}

export default function NativeNotificationsPage() {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [history, setHistory] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [form, setForm] = useState({
    target_type: 'all',
    user_id: '',
    title: '',
    body: '',
    mediaFile: null,
  });
  const [errors, setErrors] = useState({});

  const mediaPreview = useMemo(() => {
    if (!form.mediaFile) return '';
    return URL.createObjectURL(form.mediaFile);
  }, [form.mediaFile]);

  useEffect(() => {
    return () => {
      if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    };
  }, [mediaPreview]);

  const loadStats = async () => {
    const res = await getNativeNotificationStats();
    setStats(res.stats || null);
  };

  const loadHistory = async () => {
    const res = await getNativeNotificationHistory({ limit: 25 });
    setHistory(res.notifications || []);
  };

  const loadUsers = async (search = userSearch) => {
    const res = await getNativeNotificationUsers({ search, limit: 80 });
    setUsers(res.users || []);
  };

  const loadInitial = async () => {
    try {
      setIsLoading(true);
      await Promise.all([loadStats(), loadHistory(), loadUsers('')]);
    } catch (error) {
      toast({ title: 'Failed to load notification data', description: error.message, status: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitial();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers(userSearch).catch((error) => {
        toast({ title: 'Failed to search users', description: error.message, status: 'error' });
      });
    }, 250);
    return () => clearTimeout(timer);
  }, [userSearch]);

  const validate = () => {
    const nextErrors = {
      title: form.title.trim() ? '' : 'Required',
      body: form.body.trim() ? '' : 'Required',
      user_id: form.target_type === 'user' && !form.user_id ? 'Select a user' : '',
    };
    setErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  };

  const onSend = async () => {
    if (!validate()) return;

    try {
      setIsSending(true);
      const res = await sendNativeNotification(form);
      const sent = res.results?.sent_count || 0;
      const requested = res.results?.requested_recipients || 0;
      const status = requested > 0 && sent === 0 ? 'warning' : 'success';
      toast({
        title: res.message || 'Notification processed',
        description: `${sent}/${requested} device notifications sent`,
        status,
      });

      setForm((prev) => ({
        ...prev,
        title: '',
        body: '',
        mediaFile: null,
      }));
      await Promise.all([loadStats(), loadHistory()]);
    } catch (error) {
      toast({ title: 'Failed to send notification', description: error.message, status: 'error' });
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return <LoadingState text="Loading native notification tools..." />;
  }

  return (
    <>
      <PageHeader
        title="Native Notification"
        subtitle="Send push notifications to the Expo native app."
      />

      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} mb={5}>
        {[
          ['Active Users', stats?.active_users || 0],
          ['Users With App', stats?.users_with_tokens || 0],
          ['Registered Devices', stats?.active_tokens || 0],
          ['Sent Records', stats?.notifications_sent || 0],
        ].map(([label, value]) => (
          <Box key={label} bg="white" borderWidth="1px" borderRadius="lg" p={4}>
            <Text color="gray.500" fontSize="sm">{label}</Text>
            <Text fontSize="2xl" fontWeight="700">{value}</Text>
          </Box>
        ))}
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5} alignItems="start">
        <Box bg="white" borderWidth="1px" borderRadius="lg" p={5}>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Send To</FormLabel>
              <Select
                value={form.target_type}
                onChange={(e) => {
                  const targetType = e.target.value;
                  setForm((prev) => ({
                    ...prev,
                    target_type: targetType,
                    user_id: targetType === 'all' ? '' : prev.user_id,
                  }));
                }}
              >
                <option value="all">All users</option>
                <option value="user">One user</option>
              </Select>
            </FormControl>

            {form.target_type === 'user' ? (
              <>
                <FormControl>
                  <FormLabel>Search User</FormLabel>
                  <Input
                    placeholder="Search by name, mobile or email"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                </FormControl>
                <FormControl isInvalid={!!errors.user_id}>
                  <FormLabel>User</FormLabel>
                  <Select
                    value={form.user_id}
                    onChange={(e) => setForm((prev) => ({ ...prev, user_id: e.target.value }))}
                  >
                    <option value="">Select user</option>
                    {users.map((user) => (
                      <option key={user.user_id} value={user.user_id}>
                        {user.name || `User #${user.user_id}`} - {user.phone_number || 'No mobile'} ({user.push_token_count || 0} devices)
                      </option>
                    ))}
                  </Select>
                  <FormErrorMessage>{errors.user_id}</FormErrorMessage>
                </FormControl>
              </>
            ) : null}

            <FormControl isInvalid={!!errors.title}>
              <FormLabel>Title</FormLabel>
              <Input
                maxLength={160}
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              />
              <FormErrorMessage>{errors.title}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.body}>
              <FormLabel>Message</FormLabel>
              <Textarea
                rows={5}
                value={form.body}
                onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))}
              />
              <FormErrorMessage>{errors.body}</FormErrorMessage>
            </FormControl>

            <FormControl>
              <FormLabel>Media Image</FormLabel>
              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                p={1}
                onChange={(e) => setForm((prev) => ({ ...prev, mediaFile: e.target.files?.[0] || null }))}
              />
            </FormControl>

            {mediaPreview ? (
              <Box borderWidth="1px" borderRadius="md" p={3}>
                <HStack justify="space-between" mb={3}>
                  <HStack color="gray.600">
                    <FiImage />
                    <Text fontWeight="600">Media preview</Text>
                  </HStack>
                  <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<FiX />}
                    onClick={() => setForm((prev) => ({ ...prev, mediaFile: null }))}
                  >
                    Remove
                  </Button>
                </HStack>
                <Image src={mediaPreview} alt="Notification media preview" maxH="220px" borderRadius="md" objectFit="cover" />
              </Box>
            ) : null}

            <Button leftIcon={<FiSend />} onClick={onSend} isLoading={isSending}>
              Send Notification
            </Button>
          </VStack>
        </Box>

        <Box bg="white" borderWidth="1px" borderRadius="lg" overflow="hidden">
          <Box p={4} borderBottomWidth="1px">
            <Text fontWeight="700">Recent Notifications</Text>
            <Text color="gray.500" fontSize="sm">Latest native push records.</Text>
          </Box>
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead bg="gray.50">
                <Tr>
                  <Th>Notification</Th>
                  <Th>Target</Th>
                  <Th>Delivery</Th>
                  <Th>Created</Th>
                </Tr>
              </Thead>
              <Tbody>
                {history.length ? history.map((item) => (
                  <Tr key={item.notification_id}>
                    <Td minW="240px">
                      <Text fontWeight="600">{item.title}</Text>
                      <Text color="gray.500" fontSize="sm" noOfLines={2}>{item.body}</Text>
                      {item.media_url ? (
                        <Image
                          mt={2}
                          src={mediaUrl(item.media_url)}
                          alt={item.title}
                          boxSize="52px"
                          borderRadius="md"
                          objectFit="cover"
                        />
                      ) : null}
                    </Td>
                    <Td>
                      {item.target_type === 'all' ? (
                        <Badge colorScheme="blue">All users</Badge>
                      ) : (
                        <Box>
                          <Badge colorScheme="purple">One user</Badge>
                          <Text mt={1} fontSize="sm">{item.target_user_name || `#${item.target_user_id}`}</Text>
                          <Text color="gray.500" fontSize="xs">{item.target_user_mobile || ''}</Text>
                        </Box>
                      )}
                    </Td>
                    <Td>
                      <Text fontWeight="600">{item.sent_count}/{item.requested_recipients}</Text>
                      {item.failed_count > 0 ? (
                        <Text color="red.500" fontSize="sm">{item.failed_count} failed</Text>
                      ) : null}
                    </Td>
                    <Td minW="150px">
                      <Text fontSize="sm">{formatDate(item.created_at)}</Text>
                    </Td>
                  </Tr>
                )) : (
                  <Tr>
                    <Td colSpan={4}>
                      <Text color="gray.500" textAlign="center" py={8}>No native notifications sent yet.</Text>
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </SimpleGrid>
    </>
  );
}
