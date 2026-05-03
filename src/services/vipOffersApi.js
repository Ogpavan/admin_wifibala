import { apiRequest } from './api';

function appendIfPresent(form, key, value) {
  if (value === undefined || value === null || value === '') return;
  form.append(key, value);
}

function toVipFormData(payload) {
  const form = new FormData();
  appendIfPresent(form, 'plan_name', payload.plan_name);
  appendIfPresent(form, 'description', payload.description);
  appendIfPresent(form, 'speed_mbps', payload.speed_mbps);
  appendIfPresent(form, 'data_policy', payload.data_policy);
  appendIfPresent(form, 'validity_days', payload.validity_days);
  appendIfPresent(form, 'price', payload.price);
  appendIfPresent(form, 'additional_benefits', payload.additional_benefits);
  if (Array.isArray(payload.ott_platforms)) {
    form.append('ott_platforms', JSON.stringify(payload.ott_platforms));
  }
  if (payload.imageFile) {
    form.append('image', payload.imageFile);
  }
  return form;
}

export function getVipOffers() {
  return apiRequest('/api/vip-plans');
}

export function createVipOffer(payload) {
  return apiRequest('/api/vip-plans/create', {
    method: 'POST',
    body: toVipFormData(payload),
  });
}

export function updateVipOffer(id, payload) {
  return apiRequest(`/api/vip-plans/update/${id}`, {
    method: 'PUT',
    body: toVipFormData(payload),
  });
}

export function deleteVipOffer(id) {
  return apiRequest(`/api/vip-plans/delete/${id}`, {
    method: 'DELETE',
  });
}
