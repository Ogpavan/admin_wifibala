import { apiRequest } from './api';

export function getAllPortChangeRequests() {
  return apiRequest('/api/port-change-requests/admin/all');
}

export function updatePortChangeRequestStatus(requestId, payload) {
  return apiRequest(`/api/port-change-requests/${requestId}/status`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deletePortChangeRequest(requestId) {
  return apiRequest(`/api/port-change-requests/${requestId}`, {
    method: 'DELETE',
  });
}
