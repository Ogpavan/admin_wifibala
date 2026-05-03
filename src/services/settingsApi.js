import { apiRequest } from './api';

export function getSettings() {
  return apiRequest('/api/settings');
}

function toFormData(payload) {
  const form = new FormData();
  form.append('company_name', payload.company_name || '');
  form.append('primary_number', payload.primary_number || '');
  form.append('secondary_number', payload.secondary_number || '');
  form.append('whatsapp_number', payload.whatsapp_number || '');
  form.append('email_id', payload.email_id || '');
  form.append('theme_color', payload.theme_color || 'blue');
  if (payload.logoFile) form.append('logo', payload.logoFile);
  if (payload.remove_logo) form.append('remove_logo', 'true');
  return form;
}

export function createSettings(payload) {
  return apiRequest('/api/settings', {
    method: 'POST',
    body: toFormData(payload),
  });
}

export function updateSettings(id, payload) {
  return apiRequest(`/api/settings/${id}`, {
    method: 'PUT',
    body: toFormData(payload),
  });
}
