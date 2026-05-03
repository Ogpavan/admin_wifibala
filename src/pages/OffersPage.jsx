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
import { getOperators, getPlans } from '../services/plansApi';
import { createOffer, deleteOffer, getOffers, updateOffer } from '../services/offersApi';

function fmtDate(dateValue) {
  if (!dateValue) return '-';
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function OfferModal({ isOpen, onClose, onSubmit, plans, initialValues }) {
  const [form, setForm] = useState({
    plan_id: '',
    offer_name: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    max_discount: '',
    start_date: '',
    end_date: '',
    is_active: true,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;
    if (initialValues) {
      setForm({
        plan_id: String(initialValues.plan_id || ''),
        offer_name: initialValues.offer_name || '',
        description: initialValues.offer_description || '',
        discount_type: initialValues.discount_type || 'percentage',
        discount_value: String(initialValues.discount_value ?? ''),
        max_discount: initialValues.max_discount === null || initialValues.max_discount === undefined ? '' : String(initialValues.max_discount),
        start_date: initialValues.start_date ? new Date(initialValues.start_date).toISOString().slice(0, 10) : '',
        end_date: initialValues.end_date ? new Date(initialValues.end_date).toISOString().slice(0, 10) : '',
        is_active: !!initialValues.is_active,
      });
    } else {
      setForm({
        plan_id: plans[0]?.plan_id ? String(plans[0].plan_id) : '',
        offer_name: '',
        description: '',
        discount_type: 'percentage',
        discount_value: '',
        max_discount: '',
        start_date: '',
        end_date: '',
        is_active: true,
      });
    }
    setErrors({});
  }, [isOpen, initialValues, plans]);

  const handleSave = () => {
    const nextErrors = {
      plan_id: form.plan_id ? '' : 'Required',
      offer_name: form.offer_name ? '' : 'Required',
      discount_value: form.discount_value ? '' : 'Required',
      start_date: form.start_date ? '' : 'Required',
      end_date: form.end_date ? '' : 'Required',
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    onSubmit({
      plan_id: Number(form.plan_id),
      offer_name: form.offer_name,
      description: form.description,
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      max_discount: form.max_discount === '' ? null : Number(form.max_discount),
      start_date: form.start_date,
      end_date: form.end_date,
      is_active: form.is_active,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{initialValues ? 'Edit Offer' : 'Add Offer'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl isInvalid={!!errors.plan_id}>
              <FormLabel>Plan</FormLabel>
              <Select value={form.plan_id} onChange={(e) => setForm((p) => ({ ...p, plan_id: e.target.value }))}>
                <option value="">Select plan</option>
                {plans.map((plan) => (
                  <option key={plan.plan_id} value={plan.plan_id}>
                    {plan.operator_name || `#${plan.operator_id}`} - ₹{Number(plan.price || 0).toFixed(2)} - {plan.validity || '-'} days
                  </option>
                ))}
              </Select>
              <FormErrorMessage>{errors.plan_id}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.offer_name}>
              <FormLabel>Offer Name</FormLabel>
              <Input value={form.offer_name} onChange={(e) => setForm((p) => ({ ...p, offer_name: e.target.value }))} />
              <FormErrorMessage>{errors.offer_name}</FormErrorMessage>
            </FormControl>

            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} />
            </FormControl>

            <HStack align="start" spacing={3}>
              <FormControl>
                <FormLabel>Discount Type</FormLabel>
                <Select value={form.discount_type} onChange={(e) => setForm((p) => ({ ...p, discount_type: e.target.value }))}>
                  <option value="percentage">Percentage</option>
                  <option value="flat">Flat</option>
                </Select>
              </FormControl>

              <FormControl isInvalid={!!errors.discount_value}>
                <FormLabel>Discount Value</FormLabel>
                <Input type="number" value={form.discount_value} onChange={(e) => setForm((p) => ({ ...p, discount_value: e.target.value }))} />
                <FormErrorMessage>{errors.discount_value}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel>Max Discount</FormLabel>
                <Input type="number" value={form.max_discount} onChange={(e) => setForm((p) => ({ ...p, max_discount: e.target.value }))} />
              </FormControl>
            </HStack>

            <HStack align="start" spacing={3}>
              <FormControl isInvalid={!!errors.start_date}>
                <FormLabel>Start Date</FormLabel>
                <Input type="date" value={form.start_date} onChange={(e) => setForm((p) => ({ ...p, start_date: e.target.value }))} />
                <FormErrorMessage>{errors.start_date}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.end_date}>
                <FormLabel>End Date</FormLabel>
                <Input type="date" value={form.end_date} onChange={(e) => setForm((p) => ({ ...p, end_date: e.target.value }))} />
                <FormErrorMessage>{errors.end_date}</FormErrorMessage>
              </FormControl>
            </HStack>

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

export default function OffersPage() {
  const toast = useToast();
  const modal = useDisclosure();
  const deleteDialog = useDisclosure();
  const cancelRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [offers, setOffers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [operators, setOperators] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingOffer, setEditingOffer] = useState(null);
  const [deletingOffer, setDeletingOffer] = useState(null);

  const fetchMeta = async () => {
    try {
      const [plansRes, operatorsRes] = await Promise.all([
        getPlans({ page: 1, limit: 200 }),
        getOperators(),
      ]);
      setPlans(plansRes.plans || []);
      setOperators(operatorsRes.operators || []);
    } catch (error) {
      toast({ title: 'Failed to load plan metadata', description: error.message, status: 'error' });
    }
  };

  const operatorMap = useMemo(() => {
    const map = new Map();
    operators.forEach((op) => map.set(Number(op.id), op.name));
    return map;
  }, [operators]);

  const fetchOffers = async ({ initial = false } = {}) => {
    try {
      if (initial) setIsLoading(true);
      else setIsFetching(true);

      const isActive = statusFilter === 'all' ? undefined : statusFilter === 'active';
      const res = await getOffers({ isActive });
      setOffers(res.data || []);
    } catch (error) {
      toast({ title: 'Failed to load offers', description: error.message, status: 'error' });
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchMeta();
    fetchOffers({ initial: true });
  }, []);

  useEffect(() => {
    if (isLoading) return;
    fetchOffers();
  }, [statusFilter]);

  const rows = useMemo(() => {
    const now = new Date();
    return (offers || [])
      .filter((offer) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          String(offer.offer_name || '').toLowerCase().includes(q) ||
          String(offer.offer_description || '').toLowerCase().includes(q) ||
          String(offer.operator_name || '').toLowerCase().includes(q) ||
          String(offer.plan_description || '').toLowerCase().includes(q)
        );
      })
      .map((offer) => {
        const start = offer.start_date ? new Date(offer.start_date) : null;
        const end = offer.end_date ? new Date(offer.end_date) : null;
        const isScheduled = start && start > now;

        const discountText = offer.discount_type === 'percentage'
          ? `${Number(offer.discount_value).toFixed(2)}%${offer.max_discount ? ` (Max ₹${Number(offer.max_discount).toFixed(2)})` : ''}`
          : `₹${Number(offer.discount_value).toFixed(2)}`;

        return {
          id: offer.offer_id,
          offer: {
            name: offer.offer_name,
            description: offer.offer_description,
          },
          plan: {
            operator: offer.operator_name || '-',
            speed: offer.speed || '-',
            dataLimit: offer.data_limit || '-',
            price: offer.price,
            validity: offer.validity || '-',
          },
          discount: discountText,
          duration: {
            start: offer.start_date,
            end: offer.end_date,
          },
          status: {
            active: !!offer.is_active,
            scheduled: !!isScheduled,
          },
          raw: offer,
        };
      });
  }, [offers, search]);

  const columns = [
    {
      key: 'offer',
      label: 'Offer',
      render: (row) => (
        <Box>
          <Text fontWeight="600">{row.offer.name || '-'}</Text>
        </Box>
      ),
    },
    {
      key: 'plan',
      label: 'Plan',
      render: (row) => (
        <Box>
          <Text fontWeight="600">{row.plan.operator} - {row.plan.speed}</Text>
          <Text fontSize="sm" color="gray.600">
            {row.plan.dataLimit} • ₹{Number(row.plan.price || 0).toFixed(2)} • {row.plan.validity}
          </Text>
        </Box>
      ),
    },
    { key: 'discount', label: 'Discount' },
    {
      key: 'duration',
      label: 'Duration',
      render: (row) => (
        <Box>
          <Text>{fmtDate(row.duration.start)}</Text>
          <Text fontSize="sm" color="gray.600">to {fmtDate(row.duration.end)}</Text>
        </Box>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <HStack>
          <Badge colorScheme={row.status.active ? 'green' : 'red'}>{row.status.active ? 'Active' : 'Inactive'}</Badge>
          <Badge colorScheme={row.status.scheduled ? 'purple' : 'gray'}>{row.status.scheduled ? 'Scheduled' : 'Live/Ended'}</Badge>
        </HStack>
      ),
    },
  ];

  const handleSave = async (payload) => {
    try {
      if (editingOffer) {
        await updateOffer(editingOffer.offer_id, payload);
        toast({ title: 'Offer updated successfully', status: 'success' });
      } else {
        await createOffer(payload);
        toast({ title: 'Offer created successfully', status: 'success' });
      }
      modal.onClose();
      setEditingOffer(null);
      fetchOffers();
    } catch (error) {
      toast({ title: 'Failed to save offer', description: error.message, status: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deletingOffer?.offer_id) return;
    try {
      await deleteOffer(deletingOffer.offer_id);
      toast({ title: 'Offer deleted successfully', status: 'success' });
      deleteDialog.onClose();
      setDeletingOffer(null);
      fetchOffers();
    } catch (error) {
      toast({ title: 'Failed to delete offer', description: error.message, status: 'error' });
    }
  };

  return (
    <>
      <PageHeader
        title="Offers"
        subtitle={isFetching ? 'Updating results...' : 'Manage discount offers and campaign windows.'}
        actions={<Button leftIcon={<FiPlus />} onClick={() => { setEditingOffer(null); modal.onOpen(); }}>Add Offer</Button>}
      />

      <HStack mb={4} spacing={3} flexWrap="wrap">
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
        <LoadingState text="Loading offers from backend..." />
      ) : rows.length ? (
        <DataTable
          columns={columns}
          rows={rows}
          search={search}
          setSearch={setSearch}
          filter="all"
          setFilter={() => {}}
          filterOptions={[]}
          renderActions={(row) => (
            <HStack>
              <IconButton
                size="sm"
                variant="ghost"
                colorScheme="blue"
                icon={<FiEdit2 />}
                aria-label="Edit offer"
                onClick={() => {
                  setEditingOffer(row.raw);
                  modal.onOpen();
                }}
              />
              <IconButton
                size="sm"
                variant="ghost"
                colorScheme="red"
                icon={<FiTrash2 />}
                aria-label="Delete offer"
                onClick={() => {
                  setDeletingOffer(row.raw);
                  deleteDialog.onOpen();
                }}
              />
            </HStack>
          )}
        />
      ) : (
        <EmptyState
          title="No offers found"
          description="Try changing filters/search or add a new offer."
          actionLabel="Add Offer"
          onAction={() => { setEditingOffer(null); modal.onOpen(); }}
        />
      )}

      <OfferModal
        isOpen={modal.isOpen}
        onClose={() => {
          modal.onClose();
          setEditingOffer(null);
        }}
        onSubmit={handleSave}
        plans={plans.map((plan) => ({
          ...plan,
          operator_name: operatorMap.get(Number(plan.operator_id)) || `#${plan.operator_id}`,
        }))}
        initialValues={editingOffer}
      />

      <AlertDialog
        isOpen={deleteDialog.isOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => {
          deleteDialog.onClose();
          setDeletingOffer(null);
        }}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Delete Offer</AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete this offer?
              <Box mt={2} p={3} bg="gray.50" borderRadius="md">
                <Text fontWeight="600">{deletingOffer?.offer_name || '-'}</Text>
                <Text fontSize="sm" color="gray.600">{deletingOffer?.offer_description || '-'}</Text>
              </Box>
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => {
                deleteDialog.onClose();
                setDeletingOffer(null);
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
