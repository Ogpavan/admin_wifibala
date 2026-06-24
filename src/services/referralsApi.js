import { apiRequest } from './api';

export function getReferralOverview() {
  return apiRequest('/api/referrals/admin/overview');
}

export function updateReferralSettings(payload) {
  return apiRequest('/api/referrals/settings', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}
