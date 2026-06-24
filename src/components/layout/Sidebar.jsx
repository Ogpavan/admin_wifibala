import {
  Box,
  Flex,
  Icon,
  Image,
  Text,
  VStack,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  MdDashboard,
  MdPeople,
  MdSell,
  MdAutorenew,
  MdLocalOffer,
  MdWorkspacePremium,
  MdImage,
  MdReportProblem,
  MdCardGiftcard,
  MdSwapHoriz,
  MdNotificationsActive,
  MdSettings,
} from 'react-icons/md';
import { getSettings } from '../../services/settingsApi';

const navItems = [
  { label: 'Dashboard', icon: MdDashboard, to: '/dashboard' },
  { label: 'Users', icon: MdPeople, to: '/users' },
  { label: 'Plans', icon: MdSell, to: '/plans' },
  { label: 'Subscriptions', icon: MdAutorenew, to: '/subscriptions' },
  { label: 'Offers', icon: MdLocalOffer, to: '/offers' },
  { label: 'VIP Offers', icon: MdWorkspacePremium, to: '/vip-offers' },
  { label: 'Carousel', icon: MdImage, to: '/carousel' },
  { label: 'Complaints', icon: MdReportProblem, to: '/complaints' },
  { label: 'Port Change Requests', icon: MdSwapHoriz, to: '/port-change-requests' },
  { label: 'Referrals', icon: MdCardGiftcard, to: '/referrals' },
  { label: 'Native Notification', icon: MdNotificationsActive, to: '/native-notifications' },
  { label: 'Settings', icon: MdSettings, to: '/settings' },
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.askcollege.in';

function SidebarContent({ onNavigate, logoUrl }) {
  return (
    <Box h="full" bg="brand.700" borderRightWidth="1px" borderColor="brand.800" p={4}>
      <VStack align="start" spacing={3} mb={6}>
        {logoUrl ? (
          <Image
            src={`${API_BASE_URL}${logoUrl}`}
            alt="Application Logo"
            w="100%"
            h="44px"
            objectFit="contain"
          />
        ) : null}
      </VStack>
      <VStack align="stretch" spacing={1}>
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} onClick={onNavigate}>
            {({ isActive }) => (
              <Flex
                align="center"
                px={3}
                py={2.5}
                borderRadius="md"
                bg={isActive ? 'whiteAlpha.300' : 'transparent'}
                color="white"
                _hover={{ bg: 'whiteAlpha.200' }}
                gap={3}
              >
                <Icon as={item.icon} />
                <Text fontWeight={isActive ? '600' : '500'}>{item.label}</Text>
              </Flex>
            )}
          </NavLink>
        ))}
      </VStack>
    </Box>
  );
}

export default function Sidebar({ isMobileOpen, onMobileClose }) {
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const rows = await getSettings();
        const current = Array.isArray(rows) && rows.length ? rows[0] : null;
        if (current?.logo_url) setLogoUrl(current.logo_url);
      } catch {
        // Keep defaults on failure.
      }
    };
    fetchBranding();
  }, []);

  return (
    <>
      <Box display={{ base: 'none', lg: 'block' }} w="260px" pos="fixed" h="100vh">
        <SidebarContent logoUrl={logoUrl} />
      </Box>
      <Drawer isOpen={isMobileOpen} placement="left" onClose={onMobileClose}>
        <DrawerOverlay />
        <DrawerContent maxW="260px">
          <DrawerBody p={0}>
            <SidebarContent logoUrl={logoUrl} onNavigate={onMobileClose} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
