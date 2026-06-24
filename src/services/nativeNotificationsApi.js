import { apiRequest } from './api';

function toFormData(payload) {
  const form = new FormData();
  form.append('target_type', payload.target_type || 'all');
  form.append('title', payload.title || '');
  form.append('body', payload.body || '');
  if (payload.user_id) form.append('user_id', String(payload.user_id));
  if (payload.mediaFile) form.append('media', payload.mediaFile);
  return form;
}

export function getNativeNotificationStats() {
  return apiRequest('/api/native-notifications/stats');
}

export function getNativeNotificationUsers({ search = '', limit = 50 } = {}) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (search) params.set('search', search);
  return apiRequest(`/api/native-notifications/users?${params.toString()}`);
}

export function getNativeNotificationHistory({ limit = 25 } = {}) {
  return apiRequest(`/api/native-notifications/history?limit=${limit}`);
}

export function sendNativeNotification(payload) {
  return apiRequest('/api/native-notifications/send', {
    method: 'POST',
    body: toFormData(payload),
  });
}
