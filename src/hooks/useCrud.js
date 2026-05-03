import { useMemo, useState } from 'react';

export default function useCrud(initialItems, filterKey = 'status') {
  const [items, setItems] = useState(initialItems);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const text = JSON.stringify(item).toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      const matchesFilter = filter === 'all' || item[filterKey] === filter;
      return matchesSearch && matchesFilter;
    });
  }, [items, search, filter, filterKey]);

  const createItem = (payload) => {
    setItems((prev) => [...prev, { id: crypto.randomUUID(), ...payload }]);
  };

  const updateItem = (id, payload) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...payload } : item)));
  };

  const deleteItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return {
    items,
    filteredItems,
    search,
    setSearch,
    filter,
    setFilter,
    createItem,
    updateItem,
    deleteItem,
  };
}
