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
  FormLabel,
  HStack,
  IconButton,
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
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import DataTable from '../components/common/DataTable';
import EmptyState from '../components/common/EmptyState';
import LoadingState from '../components/common/LoadingState';
import PageHeader from '../components/common/PageHeader';
import {
  deleteComplaint,
  getAllComplaints,
  getComplaintStats,
  updateComplaintStatus,
} from '../services/complaintsApi';

function StatusModal({ isOpen, onClose, complaint, onSubmit }) {
  const [status, setStatus] = useState('pending');
  const [priority, setPriority] = useState('medium');
  const [resolution, setResolution] = useState('');

  useEffect(() => {
    if (!isOpen || !complaint) return;
    setStatus(complaint.status || 'pending');
    setPriority(complaint.priority || 'medium');
    setResolution(complaint.resolution || '');
  }, [isOpen, complaint]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Update Complaint</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Status</FormLabel>
              <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Priority</FormLabel>
              <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Resolution Note</FormLabel>
              <Textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                rows={3}
                placeholder="Optional resolution details"
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSubmit({ status, priority, resolution })}>Save</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default function ComplaintsPage() {
  const toast = useToast();
  const statusModal = useDisclosure();
  const deleteDialog = useDisclosure();
  const cancelRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [deletingComplaint, setDeletingComplaint] = useState(null);

  const fetchComplaints = async ({ initial = false } = {}) => {
    try {
      if (initial) setIsLoading(true);
      else setIsFetching(true);

      const [complaintsRes, statsRes] = await Promise.all([
        getAllComplaints(),
        getComplaintStats(),
      ]);
      setComplaints(complaintsRes.complaints || []);
      setStats(statsRes.stats || null);
    } catch (error) {
      toast({ title: 'Failed to load complaints', description: error.message, status: 'error' });
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchComplaints({ initial: true });
  }, []);

  const rows = useMemo(() => (
    complaints
      .filter((item) => {
        if (statusFilter !== 'all' && item.status !== statusFilter) return false;
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          String(item.user_name || '').toLowerCase().includes(q) ||
          String(item.phone_number || '').toLowerCase().includes(q) ||
          String(item.subject || '').toLowerCase().includes(q) ||
          String(item.description || '').toLowerCase().includes(q)
        );
      })
      .map((item) => ({
        id: item.complaint_id,
        user: item.user_name || '-',
        phone: item.phone_number || '-',
        subject: item.subject || '-',
        description: item.description || '-',
        priority: item.priority || 'medium',
        status: item.status || 'pending',
        created_at: item.created_at ? new Date(item.created_at).toLocaleDateString() : '-',
        raw: item,
      }))
  ), [complaints, search, statusFilter]);

  const columns = [
    { key: 'user', label: 'User' },
    { key: 'phone', label: 'Phone' },
    { key: 'subject', label: 'Subject' },
    {
      key: 'description',
      label: 'Description',
      render: (row) => <Text noOfLines={2} maxW="280px">{row.description}</Text>,
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (row) => {
        const color = row.priority === 'urgent' ? 'red' : row.priority === 'high' ? 'orange' : row.priority === 'medium' ? 'blue' : 'gray';
        return <Badge colorScheme={color}>{row.priority}</Badge>;
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const color = row.status === 'resolved' ? 'green' : row.status === 'in_progress' ? 'purple' : 'orange';
        return <Badge colorScheme={color}>{row.status}</Badge>;
      },
    },
    { key: 'created_at', label: 'Created' },
  ];

  const handleUpdate = async (payload) => {
    if (!editingComplaint?.complaint_id) return;
    try {
      await updateComplaintStatus(editingComplaint.complaint_id, payload);
      toast({ title: 'Complaint updated', status: 'success' });
      statusModal.onClose();
      setEditingComplaint(null);
      fetchComplaints();
    } catch (error) {
      toast({ title: 'Failed to update complaint', description: error.message, status: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deletingComplaint?.complaint_id) return;
    try {
      await deleteComplaint(deletingComplaint.complaint_id);
      toast({ title: 'Complaint deleted', status: 'success' });
      deleteDialog.onClose();
      setDeletingComplaint(null);
      fetchComplaints();
    } catch (error) {
      toast({ title: 'Failed to delete complaint', description: error.message, status: 'error' });
    }
  };

  return (
    <>
      <PageHeader
        title="Complaints"
        subtitle={isFetching ? 'Updating results...' : 'Track and resolve user complaints.'}
      />

      {stats ? (
        <HStack mb={4} spacing={3} flexWrap="wrap">
          <Badge colorScheme="blue">Total: {stats.total_complaints}</Badge>
          <Badge colorScheme="orange">Pending: {stats.pending_complaints}</Badge>
          <Badge colorScheme="purple">In Progress: {stats.in_progress_complaints}</Badge>
          <Badge colorScheme="green">Resolved: {stats.resolved_complaints}</Badge>
          <Badge colorScheme="red">Urgent: {stats.urgent_complaints}</Badge>
        </HStack>
      ) : null}

      <HStack mb={4}>
        <Select
          maxW="200px"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          bg="white"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </Select>
      </HStack>

      {isLoading ? (
        <LoadingState text="Loading complaints from backend..." />
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
                aria-label="Update complaint"
                onClick={() => {
                  setEditingComplaint(row.raw);
                  statusModal.onOpen();
                }}
              />
              <IconButton
                size="sm"
                variant="ghost"
                colorScheme="red"
                icon={<FiTrash2 />}
                aria-label="Delete complaint"
                onClick={() => {
                  setDeletingComplaint(row.raw);
                  deleteDialog.onOpen();
                }}
              />
            </HStack>
          )}
        />
      ) : (
        <EmptyState
          title="No complaints found"
          description="No records match the current filters."
        />
      )}

      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={() => {
          statusModal.onClose();
          setEditingComplaint(null);
        }}
        complaint={editingComplaint}
        onSubmit={handleUpdate}
      />

      <AlertDialog
        isOpen={deleteDialog.isOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => {
          deleteDialog.onClose();
          setDeletingComplaint(null);
        }}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Delete Complaint</AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete this complaint?
              <Box mt={2} p={3} bg="gray.50" borderRadius="md">
                <Text fontWeight="600">{deletingComplaint?.subject || '-'}</Text>
                <Text fontSize="sm" color="gray.600">{deletingComplaint?.user_name || '-'}</Text>
              </Box>
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => {
                deleteDialog.onClose();
                setDeletingComplaint(null);
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
