import { Box, useDisclosure } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function AdminLayout() {
  const sidebar = useDisclosure();

  return (
    <Box minH="100vh">
      <Sidebar isMobileOpen={sidebar.isOpen} onMobileClose={sidebar.onClose} />
      <Box ml={{ base: 0, lg: '260px' }}>
        <Navbar onOpenSidebar={sidebar.onOpen} />
        <Box p={{ base: 4, md: 6 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
