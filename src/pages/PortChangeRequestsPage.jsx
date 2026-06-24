import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  HStack,
  Input,
  IconButton,
  SimpleGrid,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react';
import { MdCheckCircle, MdDeleteOutline, MdPendingActions, MdRefresh, MdSearch, MdClose } from 'react-icons/md';
import EmptyState from '../components/common/EmptyState';
import ConfirmationPopup from '../components/common/ConfirmationPopup';
import LoadingState from '../components/common/LoadingState';
import {
  deletePortChangeRequest,
  getAllPortChangeRequests,
  updatePortChangeRequestStatus,
} from '../services/portChangeRequestsApi';

function formatDate(value) {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusColor(status) {
  if (status === 'approved') return 'green';
  if (status === 'completed') return 'blue';
  if (status === 'rejected') return 'red';
  return 'orange';
}

export default function PortChangeRequestsPage() {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState('');
  const [confirmation, setConfirmation] = useState(null);

  const fetchRequests = useCallback(async ({ initial = false } = {}) => {
    try {
      if (initial) setIsLoading(true);
      else setIsFetching(true);

      const response = await getAllPortChangeRequests();
      setRequests(response.requests || []);
    } catch (error) {
      toast({
        title: 'Failed to load port requests',
        description: error.message,
        status: 'error',
      });
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchRequests({ initial: true });
  }, [fetchRequests]);

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return requests;

    return requests.filter((request) =>
      [
        request.request_id,
        request.user_name,
        request.phone_number,
        request.current_provider,
        request.requested_provider,
        request.status,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [requests, search]);

  const stats = useMemo(
    () => ({
      total: requests.length,
      pending: requests.filter((request) => request.status === 'pending').length,
      approved: requests.filter((request) => request.status === 'approved').length,
      completed: requests.filter((request) => request.status === 'completed').length,
    }),
    [requests],
  );

  const getRequestKey = (request) =>
    request.request_id ??
    request.id ??
    `${request.user_name || 'user'}-${request.requested_provider || 'port'}-${request.created_at || 'time'}`;

  const handleStatusUpdate = async (requestId, status) => {
    try {
      await updatePortChangeRequestStatus(requestId, { status });
      toast({
        title: 'Port request updated',
        status: 'success',
      });
      fetchRequests();
    } catch (error) {
      toast({
        title: 'Failed to update port request',
        description: error.message,
        status: 'error',
      });
    }
  };

  const handleDeleteRequest = async (request) => {
    if (!request?.request_id) return;

    try {
      await deletePortChangeRequest(request.request_id);
      toast({
        title: 'Port request deleted',
        status: 'success',
      });
      fetchRequests();
    } catch (error) {
      toast({
        title: 'Failed to delete port request',
        description: error.message,
        status: 'error',
      });
    }
  };

  if (isLoading) {
    return <LoadingState text="Loading port change requests..." />;
  }

  return (
    <Box>
      <Flex justify="space-between" align={{ base: 'start', md: 'center' }} mb={5} direction={{ base: 'column', md: 'row' }} gap={3}>
        <Box>
          <Heading size="md">Port Change Requests</Heading>
          <Text color="gray.500">Track user requests to change service provider ports.</Text>
        </Box>
        <Button
          leftIcon={<MdRefresh />}
          onClick={() => fetchRequests()}
          isLoading={isFetching}
        >
          Refresh
        </Button>
      </Flex>

      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.500">Total</Text>
            <Heading size="md">{stats.total}</Heading>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.500">Pending</Text>
            <Heading size="md" color="orange.500">{stats.pending}</Heading>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.500">Approved</Text>
            <Heading size="md" color="green.500">{stats.approved}</Heading>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.500">Completed</Text>
            <Heading size="md" color="blue.500">{stats.completed}</Heading>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Card mb={6}>
        <CardBody>
          <HStack spacing={3}>
            <MdSearch />
            <Input
              placeholder="Search by user, phone, provider, or status"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </HStack>
        </CardBody>
      </Card>

      {filteredRequests.length === 0 ? (
        <EmptyState
          title="No port requests found"
          description="Requests submitted by users will appear here."
        />
      ) : (
        <Stack spacing={4}>
          {filteredRequests.map((request) => (
            <Card key={getRequestKey(request)}>
              <CardHeader pb={2}>
                <Flex justify="space-between" align="start" gap={4} wrap="wrap">
                  <Box>
                    <HStack mb={2} spacing={2}>
                      <Badge colorScheme={statusColor(request.status)} textTransform="capitalize">
                        {request.status}
                      </Badge>
                      <Text fontSize="sm" color="gray.500">
                        ID: {request.request_id}
                      </Text>
                    </HStack>
                    <Heading size="sm">{request.user_name || 'Unknown User'}</Heading>
                    <Text fontSize="sm" color="gray.500">
                      {request.phone_number || 'No phone saved'}
                    </Text>
                  </Box>
                  <HStack spacing={2} wrap="wrap">
                    <Button
                      size="sm"
                      leftIcon={<MdCheckCircle />}
                      colorScheme="green"
                      variant="outline"
                      onClick={() =>
                        setConfirmation({
                          title: 'Confirm Approval',
                          message: 'Are you sure you want to approve this port change request?',
                          confirmLabel: 'Approve',
                          confirmColorScheme: 'green',
                          onConfirm: () => handleStatusUpdate(request.request_id, 'approved'),
                        })
                      }
                      isDisabled={request.status === 'approved'}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      leftIcon={<MdPendingActions />}
                      colorScheme="blue"
                      variant="outline"
                      onClick={() =>
                        setConfirmation({
                          title: 'Confirm Completion',
                          message: 'Are you sure you want to mark this request as completed?',
                          confirmLabel: 'Complete',
                          confirmColorScheme: 'blue',
                          onConfirm: () => handleStatusUpdate(request.request_id, 'completed'),
                        })
                      }
                      isDisabled={request.status === 'completed'}
                    >
                      Complete
                    </Button>
                    <Button
                      size="sm"
                      leftIcon={<MdClose />}
                      colorScheme="red"
                      variant="outline"
                      onClick={() =>
                        setConfirmation({
                          title: 'Confirm Rejection',
                          message: 'Are you sure you want to reject this port change request?',
                          confirmLabel: 'Reject',
                          confirmColorScheme: 'red',
                          onConfirm: () => handleStatusUpdate(request.request_id, 'rejected'),
                        })
                      }
                      isDisabled={request.status === 'rejected'}
                    >
                      Reject
                    </Button>
                  </HStack>
                </Flex>
              </CardHeader>
              <CardBody pt={0}>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  <Box>
                    <Text fontSize="xs" color="gray.500">Current Port</Text>
                    <Text fontWeight="600">{request.current_provider || 'N/A'}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500">Requested Port</Text>
                    <Text fontWeight="600">{request.requested_provider || 'N/A'}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500">Submitted</Text>
                    <Text fontWeight="600">{formatDate(request.created_at)}</Text>
                  </Box>
                </SimpleGrid>

                <Flex justify="flex-end" mt={4}>
                  <IconButton
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    aria-label="Delete port request"
                    icon={<MdDeleteOutline />}
                    onClick={() =>
                      setConfirmation({
                        title: 'Delete Request',
                        message: 'Are you sure you want to delete this port change request? This cannot be undone.',
                        confirmLabel: 'Delete',
                        confirmColorScheme: 'red',
                        onConfirm: () => handleDeleteRequest(request),
                      })
                    }
                  />
                </Flex>
              </CardBody>
            </Card>
          ))}
        </Stack>
      )}

      <ConfirmationPopup
        isOpen={Boolean(confirmation)}
        title={confirmation?.title || ''}
        message={confirmation?.message || ''}
        confirmLabel={confirmation?.confirmLabel || 'Confirm'}
        confirmColorScheme={confirmation?.confirmColorScheme || 'red'}
        onConfirm={() => {
          const action = confirmation?.onConfirm;
          setConfirmation(null);
          if (action) action();
        }}
        onClose={() => setConfirmation(null)}
      />
    </Box>
  );
}
