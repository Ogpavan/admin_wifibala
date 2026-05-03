import { apiRequest } from './api';

export function getUsers({ page = 1, limit = 10, search = '' } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search) params.set('search', search);
  return apiRequest(`/api/auth/admin/users?${params.toString()}`);
}

export function createUser(payload) {
  return apiRequest('/api/auth/admin/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateUser(userId, payload) {
  return apiRequest(`/api/auth/admin/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteUser(userId) {
  return apiRequest(`/api/auth/admin/users/${userId}`, {
    method: 'DELETE',
  });
}

export function updateUserWallet(userId, amount) {
  return apiRequest('/api/auth/wallet/add', {
    method: 'POST',
    body: JSON.stringify({ userId, amount }),
  });
}
