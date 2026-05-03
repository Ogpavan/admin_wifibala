import { apiRequest } from './api';

export function getOffers({ isActive, planId } = {}) {
  const params = new URLSearchParams();
  if (typeof isActive === 'boolean') params.set('is_active', String(isActive));
  if (planId) params.set('plan_id', String(planId));

  const query = params.toString();
  return apiRequest(`/api/offers${query ? `?${query}` : ''}`);
}

export function createOffer(payload) {
  return apiRequest('/api/offers/create', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateOffer(id, payload) {
  return apiRequest(`/api/offers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function toggleOfferStatus(id) {
  return apiRequest(`/api/offers/${id}/toggle-status`, {
    method: 'PATCH',
  });
}

export function deleteOffer(id) {
  return apiRequest(`/api/offers/${id}`, {
    method: 'DELETE',
  });
}
