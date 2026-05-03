import {
  Avatar,
  Badge,
  Flex,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useColorMode,
} from '@chakra-ui/react';
import { FiBell, FiMenu, FiMoon, FiSearch, FiSun } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ onOpenSidebar }) {
  const { colorMode, toggleColorMode } = useColorMode();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/signin', { replace: true });
  };

  return (
    <Flex
      h="72px"
      px={{ base: 4, md: 6 }}
      bg="white"
      borderBottomWidth="1px"
      align="center"
      justify="space-between"
      pos="sticky"
      top={0}
      zIndex={20}
    >
      <HStack spacing={3}>
        <IconButton
          display={{ base: 'inline-flex', lg: 'none' }}
          icon={<Icon as={FiMenu} />}
          aria-label="Open menu"
          variant="ghost"
          onClick={onOpenSidebar}
        />
        <InputGroup maxW={{ base: '180px', md: '320px' }}>
          <InputLeftElement>
            <Icon as={FiSearch} color="gray.500" />
          </InputLeftElement>
          <Input placeholder="Search..." bg="gray.50" />
        </InputGroup>
      </HStack>

      <HStack spacing={3}>
        <IconButton
          aria-label="Toggle dark mode"
          icon={<Icon as={colorMode === 'light' ? FiMoon : FiSun} />}
          variant="ghost"
          onClick={toggleColorMode}
        />
        <IconButton
          aria-label="Notifications"
          icon={<Icon as={FiBell} />}
          variant="ghost"
          pos="relative"
        />
        <Badge colorScheme="red" borderRadius="full" px={2} ml={-4} mt={-6}>
          4
        </Badge>
        <Menu>
          <MenuButton>
            <HStack>
              <Avatar size="sm" name="Admin User" />
              <Text display={{ base: 'none', md: 'block' }} fontWeight="600">
                Admin
              </Text>
            </HStack>
          </MenuButton>
          <MenuList>
            <MenuItem>Profile</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </MenuList>
        </Menu>
      </HStack>
    </Flex>
  );
}
