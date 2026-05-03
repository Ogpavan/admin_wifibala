import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
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
  useDisclosure,
  useToast,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FiEdit2, FiPlus, FiPlusCircle, FiTrash2 } from 'react-icons/fi';
import DataTable from '../components/common/DataTable';
import EmptyState from '../components/common/EmptyState';
import LoadingState from '../components/common/LoadingState';
import PageHeader from '../components/common/PageHeader';
import { createUser, deleteUser, getUsers, updateUser, updateUserWallet } from '../services/usersApi';

function AddUserModal({ isOpen, onClose, onCreate }) {
  const [form, setForm] = useState({ name: '', mobile: '', email: '', address: '', password: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setForm({ name: '', mobile: '', email: '', address: '', password: '' });
      setErrors({});
    }
  }, [isOpen]);

  const submit = () => {
    const nextErrors = {
      name: form.name ? '' : 'Required',
      mobile: form.mobile ? '' : 'Required',
      email: '',
      address: form.address ? '' : 'Required',
      password: form.password ? '' : 'Required',
    };

    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    onCreate(form);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add User</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            {[
              ['name', 'Name'],
              ['mobile', 'Mobile'],
              ['email', 'Email'],
              ['address', 'Address'],
              ['password', 'Password'],
            ].map(([key, label]) => (
              <FormControl key={key} isInvalid={!!errors[key]}>
                <FormLabel>{label}</FormLabel>
                <Input
                  type={key === 'password' ? 'password' : key === 'email' ? 'email' : 'text'}
                  value={form[key]}
                  onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                />
                <FormErrorMessage>{errors[key]}</FormErrorMessage>
              </FormControl>
            ))}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
          <Button onClick={submit}>Create User</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function WalletModal({ isOpen, onClose, selectedUser, onSave }) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAmount(selectedUser?.wallet?.toString() || '0');
      setError('');
    }
  }, [isOpen, selectedUser]);

  const submit = () => {
    if (amount === '' || Number(amount) < 0) {
      setError('Amount must be 0 or more');
      return;
    }
    onSave(Number(amount));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Update Wallet</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl isInvalid={!!error}>
            <FormLabel>Wallet Amount</FormLabel>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <FormErrorMessage>{error}</FormErrorMessage>
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
          <Button onClick={submit}>Save</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function EditUserModal({ isOpen, onClose, user, onSave }) {
  const [form, setForm] = useState({ name: '', mobile: '', email: '', address: '', password: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen || !user) return;
    setForm({
      name: user.name || '',
      mobile: user.phone_number || '',
      email: user.email || '',
      address: user.address || '',
      password: '',
    });
    setErrors({});
  }, [isOpen, user]);

  const submit = () => {
    const nextErrors = {
      name: form.name ? '' : 'Required',
      mobile: form.mobile ? '' : 'Required',
      email: '',
      address: form.address ? '' : 'Required',
      password: '',
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;
    onSave(form);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit User</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            {[
              ['name', 'Name'],
              ['mobile', 'Mobile'],
              ['email', 'Email'],
              ['address', 'Address'],
              ['password', 'New Password (optional)'],
            ].map(([key, label]) => (
              <FormControl key={key} isInvalid={!!errors[key]}>
                <FormLabel>{label}</FormLabel>
                <Input
                  type={key === 'email' ? 'email' : key === 'password' ? 'password' : 'text'}
                  value={form[key]}
                  onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                />
                <FormErrorMessage>{errors[key]}</FormErrorMessage>
              </FormControl>
            ))}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
          <Button onClick={submit}>Save Changes</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default function UsersPage() {
  const toast = useToast();
  const addModal = useDisclosure();
  const walletModal = useDisclosure();
  const editModal = useDisclosure();
  const deleteDialog = useDisclosure();
  const cancelRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async ({
    pageArg = page,
    limitArg = limit,
    searchArg = search,
    showInitialLoader = false,
  } = {}) => {
    try {
      if (showInitialLoader) {
        setIsLoading(true);
      } else {
        setIsFetching(true);
      }
      const res = await getUsers({ page: pageArg, limit: limitArg, search: searchArg });
      setUsers(res.users || []);
      setTotal(res.pagination?.total || 0);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (error) {
      toast({ title: 'Failed to load users', description: error.message, status: 'error' });
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchUsers({ showInitialLoader: true });
  }, []);

  useEffect(() => {
    if (isLoading) return undefined;
    const timer = setTimeout(() => {
      fetchUsers();
    }, 250);
    return () => clearTimeout(timer);
  }, [page, limit, search, isLoading]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const tableUsers = useMemo(() => {
    return users.map((u) => ({
      id: u.user_id,
      name: u.name,
      phone: u.phone_number,
      email: u.email,
      address: u.address,
      wallet: Number(u.wallet || 0).toFixed(2),
      createdAt: u.created_at ? new Date(u.created_at).toLocaleDateString() : '-',
    }));
  }, [users]);

  const handleCreateUser = async (payload) => {
    try {
      await createUser(payload);
      toast({ title: 'User created successfully', status: 'success' });
      addModal.onClose();
      setPage(1);
      fetchUsers({ pageArg: 1 });
    } catch (error) {
      toast({ title: 'Failed to create user', description: error.message, status: 'error' });
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await deleteUser(id);
      toast({ title: 'User deleted successfully', status: 'success' });
      fetchUsers();
    } catch (error) {
      toast({ title: 'Failed to delete user', description: error.message, status: 'error' });
    }
  };

  const openDeleteDialog = (row) => {
    setDeletingUser(row);
    deleteDialog.onOpen();
  };

  const confirmDeleteUser = async () => {
    if (!deletingUser?.id) return;
    await handleDeleteUser(deletingUser.id);
    deleteDialog.onClose();
    setDeletingUser(null);
  };

  const openWalletModal = (row) => {
    const raw = users.find((u) => u.user_id === row.id);
    setSelectedUser(raw || null);
    walletModal.onOpen();
  };

  const openEditModal = (row) => {
    const raw = users.find((u) => u.user_id === row.id);
    setEditingUser(raw || null);
    editModal.onOpen();
  };

  const handleWalletSave = async (amount) => {
    if (!selectedUser) return;

    try {
      await updateUserWallet(selectedUser.user_id, amount);
      toast({ title: 'Wallet updated successfully', status: 'success' });
      walletModal.onClose();
      fetchUsers();
    } catch (error) {
      toast({ title: 'Failed to update wallet', description: error.message, status: 'error' });
    }
  };

  const handleEditSave = async (payload) => {
    if (!editingUser) return;
    try {
      await updateUser(editingUser.user_id, payload);
      toast({ title: 'User updated successfully', status: 'success' });
      editModal.onClose();
      fetchUsers();
    } catch (error) {
      toast({ title: 'Failed to update user', description: error.message, status: 'error' });
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'phone', label: 'Mobile' },
    { key: 'email', label: 'Email' },
    { key: 'address', label: 'Address' },
    {
      key: 'wallet',
      label: 'Wallet',
      render: (row) => (
        <HStack spacing={2}>
          <Text color="green.500" fontWeight="600">{row.wallet}</Text>
          <IconButton
            size="xs"
            variant="ghost"
            colorScheme="green"
            icon={<FiPlusCircle />}
            aria-label="Add wallet amount"
            onClick={() => openWalletModal(row)}
          />
        </HStack>
      ),
    },
    { key: 'createdAt', label: 'Created' },
  ];

  return (
    <>
      <PageHeader
        title="Users"
        subtitle={isFetching ? 'Updating results...' : 'Manage registered users from backend.'}
        actions={<Button leftIcon={<FiPlus />} onClick={addModal.onOpen}>Add User</Button>}
      />

      {isLoading ? (
        <LoadingState text="Loading users from backend..." />
      ) : tableUsers.length ? (
        <DataTable
          columns={columns}
          rows={tableUsers}
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
                aria-label="Edit user"
                onClick={() => openEditModal(row)}
              />
              <IconButton
                size="sm"
                variant="ghost"
                colorScheme="red"
                icon={<FiTrash2 />}
                aria-label="Delete"
                onClick={() => openDeleteDialog(row)}
              />
            </HStack>
          )}
        />
      ) : (
        <EmptyState
          title="No users found"
          description="Try changing search/filter or add a new user."
          actionLabel="Add User"
          onAction={addModal.onOpen}
        />
      )}

      <AddUserModal isOpen={addModal.isOpen} onClose={addModal.onClose} onCreate={handleCreateUser} />
      <WalletModal
        isOpen={walletModal.isOpen}
        onClose={walletModal.onClose}
        selectedUser={selectedUser}
        onSave={handleWalletSave}
      />
      <EditUserModal
        isOpen={editModal.isOpen}
        onClose={editModal.onClose}
        user={editingUser}
        onSave={handleEditSave}
      />

      <AlertDialog
        isOpen={deleteDialog.isOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => {
          deleteDialog.onClose();
          setDeletingUser(null);
        }}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Delete User</AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete{' '}
              <strong>{deletingUser?.name || 'this user'}</strong>? This action can be reverted only from database backup.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => {
                deleteDialog.onClose();
                setDeletingUser(null);
              }}>
                Cancel
              </Button>
              <Button colorScheme="red" ml={3} onClick={confirmDeleteUser}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}
