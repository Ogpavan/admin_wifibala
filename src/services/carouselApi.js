import { apiRequest } from './api';

function toFormData(payload) {
  const form = new FormData();
  form.append('position', String(payload.position));
  if (payload.imageFile) form.append('image', payload.imageFile);
  return form;
}

export function getCarouselSlides() {
  return apiRequest('/api/carousel');
}

export function createCarouselSlide(payload) {
  return apiRequest('/api/carousel', {
    method: 'POST',
    body: toFormData(payload),
  });
}

export function updateCarouselSlide(position, payload) {
  return apiRequest(`/api/carousel/${position}`, {
    method: 'PUT',
    body: toFormData(payload),
  });
}

export function deleteCarouselSlide(position) {
  return apiRequest(`/api/carousel/${position}`, {
    method: 'DELETE',
  });
}
