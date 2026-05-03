import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SignInPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();

  const onSubmit = (e) => {
    e.preventDefault();
    const nextErrors = {
      username: username ? '' : 'Username is required',
      password: password ? '' : 'Password is required',
    };
    setErrors(nextErrors);
    if (nextErrors.username || nextErrors.password) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const ok = login(username, password);
      setIsSubmitting(false);

      if (!ok) {
        toast({ title: 'Invalid credentials', status: 'error' });
        return;
      }

      toast({ title: 'Signed in successfully', status: 'success' });
      navigate('/dashboard', { replace: true });
    }, 300);
  };

  return (
    <Box minH="100vh" display="grid" placeItems="center" bg="gray.50" px={4}>
      <Box w="full" maxW="420px" bg="white" borderWidth="1px" borderRadius="xl" p={8} boxShadow="md">
        <VStack as="form" onSubmit={onSubmit} spacing={5} align="stretch">
          <VStack spacing={1} align="start">
            <Heading size="lg" color="brand.600">Admin Sign In</Heading>
            <Text color="gray.500">Sign in to access the WifiWala dashboard.</Text>
          </VStack>

          <FormControl isInvalid={!!errors.username}>
            <FormLabel>Username</FormLabel>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter username" />
            <FormErrorMessage>{errors.username}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.password}>
            <FormLabel>Password</FormLabel>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" />
            <FormErrorMessage>{errors.password}</FormErrorMessage>
          </FormControl>

          <Button type="submit" isLoading={isSubmitting}>Sign In</Button>
        </VStack>
      </Box>
    </Box>
  );
}
