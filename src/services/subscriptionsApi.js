import { apiRequest } from './api';

export function getSubscriptions({
  page = 1,
  limit = 10,
  search = '',
  operatorId = '',
  status = 'all',
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (search) params.set('search', search);
  if (operatorId) params.set('operator_id', String(operatorId));
  if (status && status !== 'all') params.set('status', status);

  return apiRequest(`/api/plans/subscription/all?${params.toString()}`);
}

export function createSubscription(payload) {
  return apiRequest('/api/plans/subscription', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function deleteSubscription(subscriptionId) {
  return apiRequest(`/api/plans/subscription/${subscriptionId}`, {
    method: 'DELETE',
  });
}
