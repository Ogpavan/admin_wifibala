import {
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Image,
  Input,
  SimpleGrid,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import LoadingState from '../components/common/LoadingState';
import PageHeader from '../components/common/PageHeader';
import { createSettings, getSettings, updateSettings } from '../services/settingsApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const THEME_PRESETS = [
  { key: 'blue', color: '#4169e1', label: 'Blue' },
  { key: 'green', color: '#10b981', label: 'Green' },
  { key: 'orange', color: '#f97316', label: 'Orange' },
  { key: 'rose', color: '#f43f5e', label: 'Rose' },
  { key: 'slate', color: '#64748b', label: 'Slate' },
  { key: '#7c3aed', color: '#7c3aed', label: 'Purple' },
  { key: '#0ea5e9', color: '#0ea5e9', label: 'Sky' },
  { key: '#14b8a6', color: '#14b8a6', label: 'Teal' },
];
const THEME_PRESET_MAP = Object.fromEntries(THEME_PRESETS.map((item) => [item.key, item.color]));

function resolveThemeColor(value) {
  if (typeof value !== 'string') return '#4169e1';
  if (value.startsWith('#')) return value;
  return THEME_PRESET_MAP[value] || '#4169e1';
}

export default function SettingsPage() {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [settingsId, setSettingsId] = useState(null);
  const [form, setForm] = useState({
    company_name: '',
    primary_number: '',
    whatsapp_number: '',
    email_id: '',
    logo_url: '',
    theme_color: 'blue',
  });
  const [logoFile, setLogoFile] = useState(null);
  const [removeLogo, setRemoveLogo] = useState(false);
  const selectedThemeColor = form.theme_color || 'blue';
  const selectedThemeHex = resolveThemeColor(selectedThemeColor);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const rows = await getSettings();
      const current = Array.isArray(rows) && rows.length ? rows[0] : null;
      if (current) {
        setSettingsId(current.id);
        setForm({
          company_name: current.company_name || '',
          primary_number: current.primary_number || current.secondary_number || '',
          whatsapp_number: current.whatsapp_number || '',
          email_id: current.email_id || '',
          logo_url: current.logo_url || '',
          theme_color: current.theme_color || window.localStorage.getItem('app_theme_color') || 'blue',
        });
      }
    } catch (error) {
      toast({ title: 'Failed to load settings', description: error.message, status: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const onSave = async () => {
    try {
      const payload = {
        company_name: form.company_name,
        primary_number: form.primary_number,
        secondary_number: form.primary_number,
        whatsapp_number: form.whatsapp_number,
        email_id: form.email_id,
        theme_color: form.theme_color,
        logoFile,
        remove_logo: removeLogo,
      };

      if (settingsId) {
        await updateSettings(settingsId, payload);
      } else {
        const res = await createSettings(payload);
        setSettingsId(res?.data?.id || null);
      }

      toast({ title: 'Settings saved', status: 'success' });
      window.localStorage.setItem('app_theme_color', form.theme_color || 'blue');
      setLogoFile(null);
      setRemoveLogo(false);
      loadSettings();
    } catch (error) {
      toast({ title: 'Failed to save settings', description: error.message, status: 'error' });
    }
  };

  const currentLogo = !removeLogo
    ? (logoFile ? URL.createObjectURL(logoFile) : (form.logo_url ? `${API_BASE_URL}${form.logo_url}` : ''))
    : '';

  if (isLoading) {
    return <LoadingState text="Loading application settings..." />;
  }

  return (
    <>
      <PageHeader title="Settings" subtitle="Manage application identity and support contacts." />

      <Box bg="white" borderWidth="1px" borderRadius="lg" p={5}>
        <VStack spacing={5} align="stretch">
          <FormControl>
            <FormLabel>Application Name</FormLabel>
            <Input
              value={form.company_name}
              onChange={(e) => setForm((p) => ({ ...p, company_name: e.target.value }))}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Application Logo</FormLabel>
            <VStack align="start" spacing={3}>
              {currentLogo ? (
                <Image
                  src={currentLogo}
                  alt="App logo"
                  boxSize="90px"
                  objectFit="contain"
                  borderWidth="1px"
                  borderRadius="md"
                  p={2}
                />
              ) : (
                <Text fontSize="sm" color="gray.500">No logo selected</Text>
              )}
              <Input
                type="file"
                accept="image/*"
                p={1}
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setLogoFile(file);
                  if (file) setRemoveLogo(false);
                }}
              />
              <HStack>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setLogoFile(null);
                    setRemoveLogo(true);
                  }}
                >
                  Remove Logo
                </Button>
                <Text fontSize="sm" color="gray.600">Upload to change logo</Text>
              </HStack>
            </VStack>
          </FormControl>

          <FormControl>
            <FormLabel>Support Contact Number</FormLabel>
            <Input
              value={form.primary_number}
              onChange={(e) => setForm((p) => ({ ...p, primary_number: e.target.value }))}
            />
          </FormControl>

          <FormControl>
            <FormLabel>WhatsApp Contact Number</FormLabel>
            <Input
              value={form.whatsapp_number}
              onChange={(e) => setForm((p) => ({ ...p, whatsapp_number: e.target.value }))}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Support Email</FormLabel>
            <Input
              type="email"
              value={form.email_id}
              onChange={(e) => setForm((p) => ({ ...p, email_id: e.target.value }))}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Theme Color</FormLabel>
            <VStack align="stretch" spacing={3}>
              <Box
                borderWidth="1px"
                borderRadius="lg"
                bg="gray.50"
                p={4}
              >
                <HStack justify="space-between" align="center" mb={3}>
                  <Box>
                    <Text fontWeight="600">Choose a palette</Text>
                    <Text fontSize="sm" color="gray.500">
                      Pick a preset or use the custom color picker.
                    </Text>
                  </Box>
                  <Box
                    w="44px"
                    h="44px"
                    borderRadius="full"
                    bg={selectedThemeHex}
                    borderWidth="1px"
                    borderColor="gray.200"
                    boxShadow="sm"
                  />
                </HStack>

                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
                  {THEME_PRESETS.map((item) => {
                    const isSelected = selectedThemeColor === item.key;
                    return (
                      <Button
                        key={item.key}
                        onClick={() => setForm((p) => ({ ...p, theme_color: item.key }))}
                        variant="outline"
                        justifyContent="flex-start"
                        h="auto"
                        py={3}
                        px={3}
                        borderColor={isSelected ? item.color : 'gray.200'}
                        bg={isSelected ? `${item.color}18` : 'white'}
                        _hover={{ borderColor: item.color, bg: `${item.color}10` }}
                      >
                        <HStack spacing={3} w="full" justify="flex-start">
                          <Box
                            w="16px"
                            h="16px"
                            borderRadius="full"
                            bg={item.color}
                            borderWidth="1px"
                            borderColor="blackAlpha.200"
                            flexShrink={0}
                          />
                          <VStack align="start" spacing={0} flex={1}>
                            <Text fontWeight="600" fontSize="sm">{item.label}</Text>
                            <Text fontSize="xs" color="gray.500">{item.key}</Text>
                          </VStack>
                        </HStack>
                      </Button>
                    );
                  })}
                </SimpleGrid>

                <Box mt={4}>
                  <FormLabel mb={2}>Custom color</FormLabel>
                  <HStack spacing={3} align="center">
                    <Input
                      type="color"
                      value={selectedThemeHex}
                      onChange={(e) => setForm((p) => ({ ...p, theme_color: e.target.value }))}
                      w="72px"
                      h="44px"
                      p={1}
                      cursor="pointer"
                    />
                    <Text fontSize="sm" color="gray.600">
                      Active value: {selectedThemeColor}
                    </Text>
                  </HStack>
                </Box>
              </Box>
            </VStack>
          </FormControl>

          <HStack>
            <Button alignSelf="flex-start" onClick={onSave}>Save Settings</Button>
            <Text fontSize="sm" color="gray.500">Theme applies after page refresh.</Text>
          </HStack>
        </VStack>
      </Box>
    </>
  );
}
