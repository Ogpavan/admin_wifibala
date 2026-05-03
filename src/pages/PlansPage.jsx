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
  CheckboxGroup,
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
  SimpleGrid,
  Text,
  Textarea,
  useDisclosure,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import DataTable from '../components/common/DataTable';
import EmptyState from '../components/common/EmptyState';
import LoadingState from '../components/common/LoadingState';
import PageHeader from '../components/common/PageHeader';
import {
  createPlan,
  deletePlan,
  getOperators,
  getOttPlatforms,
  getPlans,
  updatePlan,
} from '../services/plansApi';

function PlanModal({ isOpen, onClose, onSubmit, operators, ottPlatforms, initialValues }) {
  const [form, setForm] = useState({
    operator_id: '',
    description: '',
    price: '',
    validity: '',
    speed: '',
    data_limit: '',
    is_active: true,
    ott_platforms: [],
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;
    if (initialValues) {
      setForm({
        operator_id: String(initialValues.operator_id || ''),
        description: initialValues.description || '',
        price: String(initialValues.price || ''),
        validity: initialValues.validity || '',
        speed: initialValues.speed || '',
        data_limit: initialValues.data_limit || '',
        is_active: !!initialValues.is_active,
        ott_platforms: (initialValues.ott_platforms || []).map((item) => String(item.ott_id)),
      });
    } else {
      setForm({
        operator_id: operators[0]?.id ? String(operators[0].id) : '',
        description: '',
        price: '',
        validity: '',
        speed: '',
        data_limit: '',
        is_active: true,
        ott_platforms: [],
      });
    }
    setErrors({});
  }, [isOpen, initialValues, operators]);

  const handleSave = () => {
    const nextErrors = {
      operator_id: form.operator_id ? '' : 'Required',
      price: form.price ? '' : 'Required',
      validity: form.validity ? '' : 'Required',
      speed: form.speed ? '' : 'Required',
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    onSubmit({
      operator_id: Number(form.operator_id),
      description: form.description,
      price: Number(form.price),
      validity: form.validity,
      speed: form.speed,
      data_limit: form.data_limit,
      is_active: form.is_active,
      ott_platforms: form.ott_platforms.map(Number),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{initialValues ? 'Edit Plan' : 'Add Plan'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl isInvalid={!!errors.operator_id}>
                <FormLabel>Operator</FormLabel>
                <Select
                  value={form.operator_id}
                  onChange={(e) => setForm((p) => ({ ...p, operator_id: e.target.value }))}
                >
                  <option value="">Select operator</option>
                  {operators.map((op) => (
                    <option key={op.id} value={op.id}>{op.name}</option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.operator_id}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel>Status</FormLabel>
                <Select
                  value={form.is_active ? 'true' : 'false'}
                  onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.value === 'true' }))}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </Select>
              </FormControl>
            </SimpleGrid>

            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Plan description"
                rows={4}
              />
            </FormControl>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl isInvalid={!!errors.price}>
                <FormLabel>Price</FormLabel>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                />
                <FormErrorMessage>{errors.price}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.validity}>
                <FormLabel>Validity</FormLabel>
                <Input
                  value={form.validity}
                  onChange={(e) => setForm((p) => ({ ...p, validity: e.target.value }))}
                  placeholder="e.g. 30 days"
                />
                <FormErrorMessage>{errors.validity}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.speed}>
                <FormLabel>Speed</FormLabel>
                <Input
                  value={form.speed}
                  onChange={(e) => setForm((p) => ({ ...p, speed: e.target.value }))}
                  placeholder="e.g. 100 Mbps"
                />
                <FormErrorMessage>{errors.speed}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel>Data Limit</FormLabel>
                <Input
                  value={form.data_limit}
                  onChange={(e) => setForm((p) => ({ ...p, data_limit: e.target.value }))}
                  placeholder="e.g. Unlimited"
                />
              </FormControl>
            </SimpleGrid>

            <FormControl>
              <FormLabel>OTT Platforms</FormLabel>
              <CheckboxGroup
                value={form.ott_platforms}
                onChange={(values) => setForm((p) => ({ ...p, ott_platforms: values }))}
              >
                <SimpleGrid columns={{ base: 2, md: 3 }} spacing={2}>
                  {ottPlatforms.map((ott) => (
                    <Checkbox key={ott.ott_id} value={String(ott.ott_id)}>{ott.ott_name}</Checkbox>
                  ))}
                </SimpleGrid>
              </CheckboxGroup>
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

export default function PlansPage() {
  const toast = useToast();
  const modal = useDisclosure();
  const deleteDialog = useDisclosure();
  const cancelRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [plans, setPlans] = useState([]);
  const [operators, setOperators] = useState([]);
  const [ottPlatforms, setOttPlatforms] = useState([]);
  const [search, setSearch] = useState('');
  const [operatorFilter, setOperatorFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [editingPlan, setEditingPlan] = useState(null);
  const [deletingPlan, setDeletingPlan] = useState(null);

  const operatorMap = useMemo(() => {
    const map = new Map();
    operators.forEach((op) => map.set(Number(op.id), op.name));
    return map;
  }, [operators]);

  const fetchMeta = async () => {
    try {
      const [opsRes, ottRes] = await Promise.all([getOperators(), getOttPlatforms()]);
      setOperators(opsRes.operators || []);
      setOttPlatforms(ottRes.ottPlatforms || []);
    } catch (error) {
      toast({ title: 'Failed to load plan metadata', description: error.message, status: 'error' });
    }
  };

  const fetchPlans = async ({ initial = false } = {}) => {
    try {
      if (initial) setIsLoading(true);
      else setIsFetching(true);

      const res = await getPlans({
        page,
        limit,
        search,
        operatorId: operatorFilter,
        isActive: statusFilter,
      });

      setPlans(res.plans || []);
      setTotal(res.pagination?.total || 0);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (error) {
      toast({ title: 'Failed to load plans', description: error.message, status: 'error' });
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchMeta();
    fetchPlans({ initial: true });
  }, []);

  useEffect(() => {
    if (isLoading) return undefined;
    const timer = setTimeout(() => {
      fetchPlans();
    }, 250);
    return () => clearTimeout(timer);
  }, [page, limit, search, operatorFilter, statusFilter, isLoading]);

  useEffect(() => {
    setPage(1);
  }, [search, operatorFilter, statusFilter]);

  const tableRows = plans.map((plan) => ({
    id: plan.plan_id,
    description: plan.description || '-',
    operator: operatorMap.get(Number(plan.operator_id)) || `#${plan.operator_id}`,
    price: plan.price,
    validity: plan.validity,
    speed: plan.speed,
    data_limit: plan.data_limit || '-',
    status: plan.is_active ? 'active' : 'inactive',
    ott: (plan.ott_platforms || []).map((x) => x.ott_name).join(', ') || '-',
    raw: plan,
  }));

  const columns = [
    {
      key: 'description',
      label: 'Description',
      render: (row) => (
        <Text noOfLines={1} maxW="260px" title={row.description}>
          {row.description}
        </Text>
      ),
    },
    { key: 'operator', label: 'Operator' },
    { key: 'price', label: 'Price' },
    { key: 'validity', label: 'Validity' },
    { key: 'speed', label: 'Speed' },
    { key: 'data_limit', label: 'Data Limit' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge colorScheme={row.status === 'active' ? 'green' : 'orange'}>{row.status}</Badge>,
    },
    { key: 'ott', label: 'OTT' },
  ];

  const handleCreateOrUpdate = async (payload) => {
    try {
      if (editingPlan) {
        await updatePlan(editingPlan.plan_id, payload);
        toast({ title: 'Plan updated successfully', status: 'success' });
      } else {
        await createPlan(payload);
        toast({ title: 'Plan created successfully', status: 'success' });
      }
      modal.onClose();
      setEditingPlan(null);
      fetchPlans();
    } catch (error) {
      toast({ title: 'Plan save failed', description: error.message, status: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deletingPlan?.plan_id) return;
    try {
      await deletePlan(deletingPlan.plan_id);
      toast({ title: 'Plan deleted successfully', status: 'success' });
      deleteDialog.onClose();
      setDeletingPlan(null);
      fetchPlans();
    } catch (error) {
      toast({ title: 'Failed to delete plan', description: error.message, status: 'error' });
    }
  };

  return (
    <>
      <PageHeader
        title="Plans"
        subtitle={isFetching ? 'Updating results...' : 'Define and maintain subscription plans.'}
        actions={<Button leftIcon={<FiPlus />} onClick={() => { setEditingPlan(null); modal.onOpen(); }}>Add Plan</Button>}
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
          <option value="inactive">Inactive</option>
        </Select>
      </HStack>

      {isLoading ? (
        <LoadingState text="Loading plans from backend..." />
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
                colorScheme="blue"
                icon={<FiEdit2 />}
                aria-label="Edit plan"
                onClick={() => {
                  setEditingPlan(row.raw);
                  modal.onOpen();
                }}
              />
              <IconButton
                size="sm"
                variant="ghost"
                colorScheme="red"
                icon={<FiTrash2 />}
                aria-label="Delete plan"
                onClick={() => {
                  setDeletingPlan(row.raw);
                  deleteDialog.onOpen();
                }}
              />
            </HStack>
          )}
        />
      ) : (
        <EmptyState
          title="No plans found"
          description="Try changing filters/search or add a new plan."
          actionLabel="Add Plan"
          onAction={() => { setEditingPlan(null); modal.onOpen(); }}
        />
      )}

      <PlanModal
        isOpen={modal.isOpen}
        onClose={() => {
          modal.onClose();
          setEditingPlan(null);
        }}
        onSubmit={handleCreateOrUpdate}
        operators={operators}
        ottPlatforms={ottPlatforms}
        initialValues={editingPlan}
      />

      <AlertDialog
        isOpen={deleteDialog.isOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => {
          deleteDialog.onClose();
          setDeletingPlan(null);
        }}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Delete Plan</AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete this plan?
              <Box mt={2} p={3} bg="gray.50" borderRadius="md">
                <Text fontWeight="600">{deletingPlan?.description || '-'}</Text>
                <Text fontSize="sm" color="gray.600">Speed: {deletingPlan?.speed || '-'}</Text>
              </Box>
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => {
                deleteDialog.onClose();
                setDeletingPlan(null);
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
