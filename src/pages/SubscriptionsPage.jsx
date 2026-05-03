import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Badge,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Text,
  useDisclosure,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FiTrash2 } from 'react-icons/fi';
import DataTable from '../components/common/DataTable';
import EmptyState from '../components/common/EmptyState';
import LoadingState from '../components/common/LoadingState';
import PageHeader from '../components/common/PageHeader';
import { getOperators, getPlans } from '../services/plansApi';
import { getSubscriptions, createSubscription, deleteSubscription } from '../services/subscriptionsApi';
import { getUsers } from '../services/usersApi';

function SubscriptionModal({ isOpen, onClose, onSubmit, users, plans }) {
  const [form, setForm] = useState({
    user_id: '',
    plan_id: '',
    price_paid: '',
    end_date: '',
    auto_renew: false,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;
    setForm({
      user_id: users[0]?.user_id ? String(users[0].user_id) : '',
      plan_id: plans[0]?.plan_id ? String(plans[0].plan_id) : '',
      price_paid: '',
      end_date: '',
      auto_renew: false,
    });
    setErrors({});
  }, [isOpen, users, plans]);

  const handleSave = () => {
    const nextErrors = {
      user_id: form.user_id ? '' : 'Required',
      plan_id: form.plan_id ? '' : 'Required',
      price_paid: form.price_paid ? '' : 'Required',
      end_date: form.end_date ? '' : 'Required',
    };

    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    onSubmit({
      user_id: Number(form.user_id),
      plan_id: Number(form.plan_id),
      price_paid: Number(form.price_paid),
      end_date: form.end_date,
      auto_renew: form.auto_renew,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Subscription</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl isInvalid={!!errors.user_id}>
              <FormLabel>User</FormLabel>
              <Select
                value={form.user_id}
                onChange={(e) => setForm((p) => ({ ...p, user_id: e.target.value }))}
              >
                <option value="">Select user</option>
                {users.map((user) => (
                  <option key={user.user_id} value={user.user_id}>
                    {user.name || `User #${user.user_id}`}
                  </option>
                ))}
              </Select>
              <FormErrorMessage>{errors.user_id}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.plan_id}>
              <FormLabel>Plan</FormLabel>
              <Select
                value={form.plan_id}
                onChange={(e) => setForm((p) => ({ ...p, plan_id: e.target.value }))}
              >
                <option value="">Select plan</option>
                {plans.map((plan) => (
                  <option key={plan.plan_id} value={plan.plan_id}>
                    {plan.description || `Plan #${plan.plan_id}`} ({plan.price})
                  </option>
                ))}
              </Select>
              <FormErrorMessage>{errors.plan_id}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.price_paid}>
              <FormLabel>Price Paid</FormLabel>
              <Input
                type="number"
                value={form.price_paid}
                onChange={(e) => setForm((p) => ({ ...p, price_paid: e.target.value }))}
              />
              <FormErrorMessage>{errors.price_paid}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.end_date}>
              <FormLabel>End Date</FormLabel>
              <Input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm((p) => ({ ...p, end_date: e.target.value }))}
              />
              <FormErrorMessage>{errors.end_date}</FormErrorMessage>
            </FormControl>

            <FormControl>
              <Checkbox
                isChecked={form.auto_renew}
                onChange={(e) => setForm((p) => ({ ...p, auto_renew: e.target.checked }))}
              >
                Auto Renew
              </Checkbox>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default function SubscriptionsPage() {
  const toast = useToast();
  const modal = useDisclosure();
  const deleteDialog = useDisclosure();
  const cancelRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [operators, setOperators] = useState([]);
  const [search, setSearch] = useState('');
  const [operatorFilter, setOperatorFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingSubscription, setDeletingSubscription] = useState(null);

  const fetchMeta = async () => {
    try {
      const [usersRes, plansRes, operatorsRes] = await Promise.all([
        getUsers({ page: 1, limit: 200 }),
        getPlans({ page: 1, limit: 200 }),
        getOperators(),
      ]);
      setUsers(usersRes.users || []);
      setPlans(plansRes.plans || []);
      setOperators(operatorsRes.operators || []);
    } catch (error) {
      toast({ title: 'Failed to load users/plans', description: error.message, status: 'error' });
    }
  };

  const fetchSubscriptions = async ({ initial = false } = {}) => {
    try {
      if (initial) setIsLoading(true);
      else setIsFetching(true);

      const res = await getSubscriptions({
        page,
        limit,
        search,
        operatorId: operatorFilter,
        status: statusFilter,
      });
      setSubscriptions(res.subscriptions || []);
      setTotal(res.total || 0);
      setTotalPages(Math.max(1, Math.ceil((res.total || 0) / limit)));
    } catch (error) {
      toast({ title: 'Failed to load subscriptions', description: error.message, status: 'error' });
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchMeta();
    fetchSubscriptions({ initial: true });
  }, []);

  useEffect(() => {
    if (isLoading) return undefined;
    const timer = setTimeout(() => {
      fetchSubscriptions();
    }, 250);
    return () => clearTimeout(timer);
  }, [page, limit, search, operatorFilter, statusFilter, isLoading]);

  useEffect(() => {
    setPage(1);
  }, [search, operatorFilter, statusFilter]);

  const tableRows = useMemo(() => (
    subscriptions.map((subscription) => ({
      id: subscription.subscription_id,
      user_name: subscription.user_name || `#${subscription.user_id}`,
      phone_number: subscription.phone_number || '-',
      operator_name: subscription.operator_name || '-',
      plan_price: subscription.plan_price ?? subscription.price_paid ?? '-',
      data_limit: subscription.data_limit || '-',
      end_date: subscription.end_date ? new Date(subscription.end_date).toISOString().slice(0, 10) : '-',
      status: subscription.end_date && new Date(subscription.end_date) >= new Date() ? 'active' : 'expired',
      raw: subscription,
    }))
  ), [subscriptions]);

  const columns = [
    { key: 'user_name', label: 'User Name' },
    { key: 'phone_number', label: 'Phone' },
    { key: 'operator_name', label: 'Operator' },
    {
      key: 'plan_price',
      label: 'Plan Price',
      render: (row) => `${row.plan_price} (${row.data_limit})`,
    },
    { key: 'end_date', label: 'End Date' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge colorScheme={row.status === 'active' ? 'green' : 'orange'}>{row.status}</Badge>,
    },
  ];

  const handleCreate = async (payload) => {
    try {
      await createSubscription(payload);
      toast({ title: 'Subscription created successfully', status: 'success' });
      modal.onClose();
      fetchSubscriptions();
    } catch (error) {
      toast({ title: 'Failed to create subscription', description: error.message, status: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deletingSubscription?.subscription_id) return;
    try {
      await deleteSubscription(deletingSubscription.subscription_id);
      toast({ title: 'Subscription deleted successfully', status: 'success' });
      deleteDialog.onClose();
      setDeletingSubscription(null);
      fetchSubscriptions();
    } catch (error) {
      toast({ title: 'Failed to delete subscription', description: error.message, status: 'error' });
    }
  };

  return (
    <>
      <PageHeader
        title="Subscriptions"
        subtitle={isFetching ? 'Updating results...' : 'Track subscription lifecycle and status.'}
      />
      <HStack mb={4} spacing={3} flexWrap="wrap">
        <Select
          maxW="240px"
          value={operatorFilter}
          onChange={(e) => setOperatorFilter(e.target.value)}
          bg="white"
        >
          <option value="">All Operators</option>
          {operators.map((op) => (
            <option key={op.id} value={op.id}>{op.name}</option>
          ))}
        </Select>

        <Select
          maxW="180px"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          bg="white"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
        </Select>
      </HStack>

      {isLoading ? (
        <LoadingState text="Loading subscriptions from backend..." />
      ) : tableRows.length ? (
        <DataTable
          columns={columns}
          rows={tableRows}
          search={search}
          setSearch={setSearch}
          filter="all"
          setFilter={() => {}}
          filterOptions={[]}
          serverPagination
          currentPage={page}
          totalItems={total}
          totalPages={totalPages}
          controlledPageSize={limit}
          onPageChange={setPage}
          onPageSizeChange={(nextLimit) => {
            setLimit(nextLimit);
            setPage(1);
          }}
          renderActions={(row) => (
            <HStack>
              <IconButton
                size="sm"
                variant="ghost"
                colorScheme="red"
                icon={<FiTrash2 />}
                aria-label="Delete subscription"
                onClick={() => {
                  setDeletingSubscription(row.raw);
                  deleteDialog.onOpen();
                }}
              />
            </HStack>
          )}
        />
      ) : (
        <EmptyState
          title="No subscriptions found"
          description="Try changing search or create a new subscription."
          actionLabel="Add Subscription"
          onAction={modal.onOpen}
        />
      )}

      <SubscriptionModal
        isOpen={modal.isOpen}
        onClose={modal.onClose}
        onSubmit={handleCreate}
        users={users}
        plans={plans}
      />

      <AlertDialog
        isOpen={deleteDialog.isOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => {
          deleteDialog.onClose();
          setDeletingSubscription(null);
        }}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Delete Subscription</AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete this subscription?
              <Box mt={2} p={3} bg="gray.50" borderRadius="md">
                <Text fontWeight="600">{deletingSubscription?.user_name || '-'}</Text>
                <Text fontSize="sm" color="gray.600">{deletingSubscription?.plan_description || '-'}</Text>
              </Box>
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => {
                deleteDialog.onClose();
                setDeletingSubscription(null);
              }}>
                Cancel
              </Button>
              <Button colorScheme="red" ml={3} onClick={handleDelete}>Delete</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}
