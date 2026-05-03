import { apiRequest } from './api';

export function getAllComplaints() {
  return apiRequest('/api/complaints/admin/all');
}

export function getComplaintStats() {
  return apiRequest('/api/complaints/admin/stats');
}

export function updateComplaintStatus(id, payload) {
  return apiRequest(`/api/complaints/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteComplaint(id) {
  return apiRequest(`/api/complaints/${id}`, {
    method: 'DELETE',
  });
}
