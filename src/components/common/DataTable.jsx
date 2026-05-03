import {
  Box,
  Button,
  ButtonGroup,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select as ChakraSelect,
  Select,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Flex,
  Icon,
} from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';
import { useEffect, useMemo, useState } from 'react';

export default function DataTable({
  columns,
  rows,
  search,
  setSearch,
  filter,
  setFilter,
  filterOptions,
  renderActions,
  defaultPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
  serverPagination = false,
  currentPage,
  totalItems,
  totalPages: controlledTotalPages,
  onPageChange,
  onPageSizeChange,
  controlledPageSize,
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const activePage = serverPagination ? currentPage || 1 : page;
  const activePageSize = serverPagination ? controlledPageSize || defaultPageSize : pageSize;
  const totalCount = serverPagination ? totalItems || 0 : rows.length;
  const totalPages = serverPagination
    ? Math.max(controlledTotalPages || 1, 1)
    : Math.max(1, Math.ceil(rows.length / activePageSize));

  const paginatedRows = useMemo(() => {
    if (serverPagination) return rows;
    const start = (activePage - 1) * activePageSize;
    return rows.slice(start, start + activePageSize);
  }, [rows, activePage, activePageSize, serverPagination]);

  useEffect(() => {
    if (!serverPagination) setPage(1);
  }, [search, filter, rows.length, pageSize, serverPagination]);

  useEffect(() => {
    if (!serverPagination && page > totalPages) setPage(totalPages);
  }, [page, totalPages, serverPagination]);

  return (
    <Box bg="white" borderWidth="1px" borderRadius="lg" overflow="hidden">
      <Flex p={4} gap={3} direction={{ base: 'column', md: 'row' }}>
        <InputGroup maxW={{ base: 'full', md: '320px' }}>
          <InputLeftElement>
            <Icon as={FiSearch} color="gray.500" />
          </InputLeftElement>
          <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </InputGroup>
        {filterOptions?.length ? (
          <Select maxW={{ base: 'full', md: '220px' }} value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All</option>
            {filterOptions.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </Select>
        ) : null}
      </Flex>
      <Box overflowX="auto">
        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              {columns.map((col) => <Th key={col.key}>{col.label}</Th>)}
              {renderActions ? <Th>Actions</Th> : null}
            </Tr>
          </Thead>
          <Tbody>
            {paginatedRows.map((row) => (
              <Tr key={row.id}>
                {columns.map((col) => (
                  <Td key={col.key}>
                    {col.render ? col.render(row) : <Text>{row[col.key]}</Text>}
                  </Td>
                ))}
                {renderActions ? <Td>{renderActions(row)}</Td> : null}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
      <Flex p={4} borderTopWidth="1px" justify="space-between" align="center" direction={{ base: 'column', md: 'row' }} gap={3}>
        <Text color="gray.600" fontSize="sm">
          Showing {totalCount === 0 ? 0 : (activePage - 1) * activePageSize + 1}-
          {Math.min(activePage * activePageSize, totalCount)} of {totalCount}
        </Text>
        <HStack>
          <ChakraSelect
            w="90px"
            value={activePageSize}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (serverPagination) {
                onPageSizeChange?.(value);
              } else {
                setPageSize(value);
              }
            }}
            size="sm"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>{size}/page</option>
            ))}
          </ChakraSelect>
          <ButtonGroup size="sm" isAttached variant="outline">
            <Button
              onClick={() =>
                serverPagination
                  ? onPageChange?.(Math.max(1, activePage - 1))
                  : setPage((p) => Math.max(1, p - 1))
              }
              isDisabled={activePage === 1}
            >
              Prev
            </Button>
            <Button isDisabled>
              {activePage}/{totalPages}
            </Button>
            <Button
              onClick={() =>
                serverPagination
                  ? onPageChange?.(Math.min(totalPages, activePage + 1))
                  : setPage((p) => Math.min(totalPages, p + 1))
              }
              isDisabled={activePage === totalPages}
            >
              Next
            </Button>
          </ButtonGroup>
        </HStack>
      </Flex>
    </Box>
  );
}
