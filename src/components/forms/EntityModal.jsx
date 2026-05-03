import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  VStack,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';

export default function EntityModal({ isOpen, onClose, title, fields, initialValues, onSubmit }) {
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(initialValues || {});
    setErrors({});
  }, [initialValues, isOpen]);

  const handleSave = () => {
    const nextErrors = {};
    fields.forEach((field) => {
      if (field.validate) {
        const error = field.validate(form[field.name]);
        if (error) nextErrors[field.name] = error;
      }
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onSubmit(form);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            {fields.map((field) => (
              <FormControl key={field.name} isInvalid={!!errors[field.name]}>
                <FormLabel>{field.label}</FormLabel>
                {field.type === 'select' ? (
                  <Select
                    value={form[field.name] || ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, [field.name]: e.target.value }))}
                  >
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </Select>
                ) : (
                  <Input
                    type={field.type || 'text'}
                    value={form[field.name] || ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, [field.name]: e.target.value }))}
                  />
                )}
                <FormErrorMessage>{errors[field.name]}</FormErrorMessage>
              </FormControl>
            ))}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
