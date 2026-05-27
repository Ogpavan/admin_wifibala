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
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import DataTable from '../components/common/DataTable';
import EmptyState from '../components/common/EmptyState';
import LoadingState from '../components/common/LoadingState';
import PageHeader from '../components/common/PageHeader';
import {
  createCarouselSlide,
  deleteCarouselSlide,
  getCarouselSlides,
  updateCarouselSlide,
} from '../services/carouselApi';

function SlideModal({ isOpen, onClose, onSubmit, initialValues }) {
  const [form, setForm] = useState({ position: '', imageFile: null });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;
    setForm({
      position: initialValues ? String(initialValues.position) : '',
      imageFile: null,
    });
    setErrors({});
  }, [isOpen, initialValues]);

  const handleSave = () => {
    const nextErrors = {
      position: form.position ? '' : 'Required',
      imageFile: form.imageFile ? '' : 'Image is required',
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;
    onSubmit({ position: Number(form.position), imageFile: form.imageFile });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{initialValues ? 'Update Slide' : 'Add Slide'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl isInvalid={!!errors.position}>
              <FormLabel>Position</FormLabel>
              <Input
                type="number"
                value={form.position}
                isDisabled={!!initialValues}
                onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))}
              />
              <FormErrorMessage>{errors.position}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={!!errors.imageFile}>
              <FormLabel>Image</FormLabel>
              <Input
                type="file"
                accept="image/*"
                p={1}
                onChange={(e) => setForm((p) => ({ ...p, imageFile: e.target.files?.[0] || null }))}
              />
              <FormErrorMessage>{errors.imageFile}</FormErrorMessage>
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

export default function CarouselPage() {
  const toast = useToast();
  const modal = useDisclosure();
  const deleteDialog = useDisclosure();
  const previewModal = useDisclosure();
  const cancelRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [slides, setSlides] = useState([]);
  const [search, setSearch] = useState('');
  const [editingSlide, setEditingSlide] = useState(null);
  const [deletingSlide, setDeletingSlide] = useState(null);
  const [previewImageUrl, setPreviewImageUrl] = useState('');

  const fetchSlides = async () => {
    try {
      setIsLoading(true);
      const res = await getCarouselSlides();
      setSlides(Array.isArray(res) ? res : []);
    } catch (error) {
      toast({ title: 'Failed to load slides', description: error.message, status: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const rows = slides
    .filter((s) => String(s.position).toLowerCase().includes(search.toLowerCase()))
    .map((s) => ({
      id: s.id,
      position: s.position,
      image_url: s.image_url,
      updated_at: s.updated_at ? new Date(s.updated_at).toLocaleString() : '-',
      status: 'active',
      raw: s,
    }));

  const columns = [
    { key: 'position', label: 'Position' },
    {
      key: 'image_url',
      label: 'Image',
      render: (row) => (
        <HStack>
          <Image
            src={`${import.meta.env.VITE_API_BASE_URL || 'https://api.askcollege.in'}${row.image_url}`}
            alt={`Slide ${row.position}`}
            boxSize="48px"
            objectFit="cover"
            borderRadius="md"
            cursor="pointer"
            onClick={() => {
              setPreviewImageUrl(`${import.meta.env.VITE_API_BASE_URL || 'https://api.askcollege.in'}${row.image_url}`);
              previewModal.onOpen();
            }}
            fallback={<Box boxSize="48px" bg="gray.100" borderRadius="md" />}
          />
        </HStack>
      ),
    },
    { key: 'updated_at', label: 'Updated At' },
    {
      key: 'status',
      label: 'Status',
      render: () => <Badge colorScheme="green">active</Badge>,
    },
  ];

  const handleSave = async (payload) => {
    try {
      if (editingSlide) {
        await updateCarouselSlide(editingSlide.position, payload);
        toast({ title: 'Slide updated successfully', status: 'success' });
      } else {
        await createCarouselSlide(payload);
        toast({ title: 'Slide created successfully', status: 'success' });
      }
      modal.onClose();
      setEditingSlide(null);
      fetchSlides();
    } catch (error) {
      toast({ title: 'Failed to save slide', description: error.message, status: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deletingSlide?.position) return;
    try {
      await deleteCarouselSlide(deletingSlide.position);
      toast({ title: 'Slide deleted successfully', status: 'success' });
      deleteDialog.onClose();
      setDeletingSlide(null);
      fetchSlides();
    } catch (error) {
      toast({ title: 'Failed to delete slide', description: error.message, status: 'error' });
    }
  };

  return (
    <>
      <PageHeader
        title="Carousels"
        subtitle="Manage app homepage banners."
        actions={<Button leftIcon={<FiPlus />} onClick={() => { setEditingSlide(null); modal.onOpen(); }}>Add Slide</Button>}
      />

      {isLoading ? (
        <LoadingState text="Loading carousel slides from backend..." />
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
                aria-label="Edit slide"
                onClick={() => {
                  setEditingSlide(row.raw);
                  modal.onOpen();
                }}
              />
              <IconButton
                size="sm"
                variant="ghost"
                colorScheme="red"
                icon={<FiTrash2 />}
                aria-label="Delete slide"
                onClick={() => {
                  setDeletingSlide(row.raw);
                  deleteDialog.onOpen();
                }}
              />
            </HStack>
          )}
        />
      ) : (
        <EmptyState
          title="No slides found"
          description="Add a carousel slide to get started."
          actionLabel="Add Slide"
          onAction={() => { setEditingSlide(null); modal.onOpen(); }}
        />
      )}

      <SlideModal
        isOpen={modal.isOpen}
        onClose={() => {
          modal.onClose();
          setEditingSlide(null);
        }}
        onSubmit={handleSave}
        initialValues={editingSlide}
      />

      <AlertDialog
        isOpen={deleteDialog.isOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => {
          deleteDialog.onClose();
          setDeletingSlide(null);
        }}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Delete Slide</AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete slide at position {deletingSlide?.position}?
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => {
                deleteDialog.onClose();
                setDeletingSlide(null);
              }}>
                Cancel
              </Button>
              <Button colorScheme="red" ml={3} onClick={handleDelete}>Delete</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <Modal isOpen={previewModal.isOpen} onClose={previewModal.onClose} isCentered size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Image Preview</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Image
              src={previewImageUrl}
              alt="Carousel preview"
              w="100%"
              maxH="70vh"
              objectFit="contain"
              borderRadius="md"
            />
          </ModalBody>
          <ModalFooter>
            <Button onClick={previewModal.onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
