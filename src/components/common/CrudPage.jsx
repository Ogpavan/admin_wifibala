import { Button, HStack, IconButton, useDisclosure, useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import PageHeader from './PageHeader';
import DataTable from './DataTable';
import EmptyState from './EmptyState';
import EntityModal from '../forms/EntityModal';
import useCrud from '../../hooks/useCrud';
import LoadingState from './LoadingState';

export default function CrudPage({ title, subtitle, fields, columns, initialData, filterKey, filterOptions }) {
  const toast = useToast();
  const modal = useDisclosure();
  const crud = useCrud(initialData, filterKey);
  const { filteredItems, search, setSearch, filter, setFilter, createItem, updateItem, deleteItem } = crud;
  const [editing, setEditing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  function onCreate() {
    setEditing(null);
    modal.onOpen();
  }

  function onEdit(item) {
    setEditing(item);
    modal.onOpen();
  }

  function onDelete(id) {
    deleteItem(id);
    toast({ title: 'Deleted successfully', status: 'success' });
  }

  function onSubmit(payload) {
    if (editing) {
      updateItem(editing.id, payload);
      toast({ title: 'Updated successfully', status: 'success' });
      return;
    }
    createItem(payload);
    toast({ title: 'Created successfully', status: 'success' });
  }

  return (
    <>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={<Button leftIcon={<FiPlus />} onClick={onCreate}>Add New</Button>}
      />

      {isLoading ? (
        <LoadingState />
      ) : filteredItems.length ? (
        <DataTable
          columns={columns}
          rows={filteredItems}
          search={search}
          setSearch={setSearch}
          filter={filter}
          setFilter={setFilter}
          filterOptions={filterOptions}
          renderActions={(row) => (
            <HStack>
              <IconButton size="sm" variant="ghost" icon={<FiEdit2 />} aria-label="Edit" onClick={() => onEdit(row)} />
              <IconButton size="sm" variant="ghost" colorScheme="red" icon={<FiTrash2 />} aria-label="Delete" onClick={() => onDelete(row.id)} />
            </HStack>
          )}
        />
      ) : (
        <EmptyState title={`No ${title} found`} description="Try adjusting search/filter or create a new record." actionLabel="Create" onAction={onCreate} />
      )}

      <EntityModal
        isOpen={modal.isOpen}
        onClose={modal.onClose}
        title={`${editing ? 'Edit' : 'Add'} ${title.slice(0, -1)}`}
        fields={fields}
        initialValues={editing}
        onSubmit={onSubmit}
      />
    </>
  );
}
