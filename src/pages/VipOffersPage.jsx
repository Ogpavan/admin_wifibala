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
import { getOttPlatforms } from '../services/plansApi';
import { createVipOffer, deleteVipOffer, getVipOffers, updateVipOffer } from '../services/vipOffersApi';

function VipModal({ isOpen, onClose, onSubmit, ottPlatforms, initialValues }) {
  const [form, setForm] = useState({
    plan_name: '',
    description: '',
    speed_mbps: '',
    data_policy: '',
    validity_days: '',
    price: '',
    additional_benefits: '',
    ott_platforms: [],
    imageFile: null,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;
    if (initialValues) {
      setForm({
        plan_name: initialValues.plan_name || '',
        description: initialValues.description || '',
        speed_mbps: initialValues.speed_mbps || '',
        data_policy: initialValues.data_policy || '',
        validity_days: String(initialValues.validity_days || ''),
        price: String(initialValues.price || ''),
        additional_benefits: Array.isArray(initialValues.additional_benefits)
          ? initialValues.additional_benefits.join(', ')
          : '',
        ott_platforms: (initialValues.ott_platforms || []).map((x) => String(x.ott_id)),
        imageFile: null,
      });
    } else {
      setForm({
        plan_name: '',
        description: '',
        speed_mbps: '',
        data_policy: '',
        validity_days: '',
        price: '',
        additional_benefits: '',
        ott_platforms: [],
        imageFile: null,
      });
    }
    setErrors({});
  }, [isOpen, initialValues]);

  const handleSave = () => {
    const nextErrors = {
      plan_name: form.plan_name ? '' : 'Required',
      data_policy: form.data_policy ? '' : 'Required',
      validity_days: form.validity_days ? '' : 'Required',
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    onSubmit({
      plan_name: form.plan_name,
      description: form.description,
      speed_mbps: form.speed_mbps,
      data_policy: form.data_policy,
      validity_days: Number(form.validity_days),
      price: form.price === '' ? 0 : Number(form.price),
      additional_benefits: form.additional_benefits,
      ott_platforms: form.ott_platforms.map(Number),
      imageFile: form.imageFile,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{initialValues ? 'Edit VIP Offer' : 'Add VIP Offer'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl isInvalid={!!errors.plan_name}>
              <FormLabel>Plan Name</FormLabel>
              <Input value={form.plan_name} onChange={(e) => setForm((p) => ({ ...p, plan_name: e.target.value }))} />
              <FormErrorMessage>{errors.plan_name}</FormErrorMessage>
            </FormControl>

            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} />
            </FormControl>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <FormControl>
                <FormLabel>Speed (Mbps)</FormLabel>
                <Input value={form.speed_mbps} onChange={(e) => setForm((p) => ({ ...p, speed_mbps: e.target.value }))} />
              </FormControl>
              <FormControl isInvalid={!!errors.data_policy}>
                <FormLabel>Data Limit</FormLabel>
                <Input value={form.data_policy} onChange={(e) => setForm((p) => ({ ...p, data_policy: e.target.value }))} />
                <FormErrorMessage>{errors.data_policy}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.validity_days}>
                <FormLabel>Validity (Days)</FormLabel>
                <Input type="number" value={form.validity_days} onChange={(e) => setForm((p) => ({ ...p, validity_days: e.target.value }))} />
                <FormErrorMessage>{errors.validity_days}</FormErrorMessage>
              </FormControl>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel>Price</FormLabel>
                <Input type="number" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} />
              </FormControl>
              <FormControl>
                <FormLabel>Image</FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setForm((p) => ({ ...p, imageFile: e.target.files?.[0] || null }))}
                  p={1}
                />
              </FormControl>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
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

              <FormControl>
                <FormLabel>Additional Benefits (comma separated)</FormLabel>
                <Textarea
                  value={form.additional_benefits}
                  onChange={(e) => setForm((p) => ({ ...p, additional_benefits: e.target.value }))}
                  rows={2}
                />
              </FormControl>
            </SimpleGrid>
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

export default function VipOffersPage() {
  const toast = useToast();
  const modal = useDisclosure();
  const deleteDialog = useDisclosure();
  const cancelRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [ottPlatforms, setOttPlatforms] = useState([]);
  const [search, setSearch] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  const fetchAll = async () => {
    try {
      setIsLoading(true);
      const [vipRes, ottRes] = await Promise.all([getVipOffers(), getOttPlatforms()]);
      setItems(Array.isArray(vipRes) ? vipRes : []);
      setOttPlatforms(ottRes.ottPlatforms || []);
    } catch (error) {
      toast({ title: 'Failed to load VIP offers', description: error.message, status: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const rows = useMemo(() => (
    items
      .filter((item) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          String(item.plan_name || '').toLowerCase().includes(q) ||
          String(item.data_policy || '').toLowerCase().includes(q) ||
          String(item.description || '').toLowerCase().includes(q)
        );
      })
      .map((item) => ({
        id: item.id,
        plan_name: item.plan_name || '-',
        speed: item.speed_mbps ? `${item.speed_mbps} Mbps` : '-',
        data_policy: item.data_policy || '-',
        validity: item.validity_days ? `${item.validity_days} days` : '-',
        price: `₹${Number(item.price || 0).toFixed(2)}`,
        ott: (item.ott_platforms || []).map((x) => x.ott_name).join(', ') || '-',
        status: 'active',
        raw: item,
      }))
  ), [items, search]);

  const columns = [
    { key: 'plan_name', label: 'Plan Name' },
    { key: 'speed', label: 'Speed' },
    { key: 'data_policy', label: 'Data Limit' },
    { key: 'validity', label: 'Validity' },
    { key: 'price', label: 'Price' },
    { key: 'ott', label: 'OTT' },
    {
      key: 'status',
      label: 'Status',
      render: () => <Badge colorScheme="green">active</Badge>,
    },
  ];

  const handleSave = async (payload) => {
    try {
      if (editingItem) {
        await updateVipOffer(editingItem.id, payload);
        toast({ title: 'VIP offer updated', status: 'success' });
      } else {
        await createVipOffer(payload);
        toast({ title: 'VIP offer created', status: 'success' });
      }
      modal.onClose();
      setEditingItem(null);
      fetchAll();
    } catch (error) {
      toast({ title: 'Failed to save VIP offer', description: error.message, status: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deletingItem?.id) return;
    try {
      await deleteVipOffer(deletingItem.id);
      toast({ title: 'VIP offer deleted', status: 'success' });
      deleteDialog.onClose();
      setDeletingItem(null);
      fetchAll();
    } catch (error) {
      toast({ title: 'Failed to delete VIP offer', description: error.message, status: 'error' });
    }
  };

  return (
    <>
      <PageHeader
        title="VIP Offers"
        subtitle="Premium-only campaign management."
        actions={<Button leftIcon={<FiPlus />} onClick={() => { setEditingItem(null); modal.onOpen(); }}>Add VIP Offer</Button>}
      />

      {isLoading ? (
        <LoadingState text="Loading VIP offers from backend..." />
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
                aria-label="Edit VIP offer"
                onClick={() => {
                  setEditingItem(row.raw);
                  modal.onOpen();
                }}
              />
              <IconButton
                size="sm"
                variant="ghost"
                colorScheme="red"
                icon={<FiTrash2 />}
                aria-label="Delete VIP offer"
                onClick={() => {
                  setDeletingItem(row.raw);
                  deleteDialog.onOpen();
                }}
              />
            </HStack>
          )}
        />
      ) : (
        <EmptyState
          title="No VIP offers found"
          description="Create a VIP offer to get started."
          actionLabel="Add VIP Offer"
          onAction={() => { setEditingItem(null); modal.onOpen(); }}
        />
      )}

      <VipModal
        isOpen={modal.isOpen}
        onClose={() => {
          modal.onClose();
          setEditingItem(null);
        }}
        onSubmit={handleSave}
        ottPlatforms={ottPlatforms}
        initialValues={editingItem}
      />

      <AlertDialog
        isOpen={deleteDialog.isOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => {
          deleteDialog.onClose();
          setDeletingItem(null);
        }}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Delete VIP Offer</AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete this VIP offer?
              <Box mt={2} p={3} bg="gray.50" borderRadius="md">
                <Text fontWeight="600">{deletingItem?.plan_name || '-'}</Text>
                <Text fontSize="sm" color="gray.600">{deletingItem?.data_policy || '-'}</Text>
              </Box>
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => {
                deleteDialog.onClose();
                setDeletingItem(null);
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
