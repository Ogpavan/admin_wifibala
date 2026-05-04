import { apiRequest } from './api';

export function getPlans({ page = 1, limit = 10, search = '', operatorId = '', isActive = 'all' } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.set('search', search);
  if (operatorId) params.set('operator_id', String(operatorId));
  if (isActive === 'active') params.set('is_active', 'true');
  if (isActive === 'inactive') params.set('is_active', 'false');

  return apiRequest(`/api/plans?${params.toString()}`);
}

export function getOperators() {
  return apiRequest('/api/plans/operators');
}

export function getOttPlatforms() {
  return apiRequest('/api/plans/ott-platforms');
}

function toOttFormData(payload) {
  const form = new FormData();
  form.append('ott_name', payload.ott_name || '');
  if (payload.logoFile) form.append('logo', payload.logoFile);
  if (payload.remove_logo) form.append('remove_logo', 'true');
  return form;
}

export function createOttPlatform(payload) {
  return apiRequest('/api/plans/ott-platforms', {
    method: 'POST',
    body: toOttFormData(payload),
  });
}

export function updateOttPlatform(id, payload) {
  return apiRequest(`/api/plans/ott-platforms/${id}`, {
    method: 'PUT',
    body: toOttFormData(payload),
  });
}

export function deleteOttPlatform(id) {
  return apiRequest(`/api/plans/ott-platforms/${id}`, {
    method: 'DELETE',
  });
}

export function createPlan(payload) {
  return apiRequest('/api/plans/create', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updatePlan(id, payload) {
  return apiRequest(`/api/plans/update/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deletePlan(id) {
  return apiRequest(`/api/plans/delete/${id}`, {
    method: 'DELETE',
  });
}
