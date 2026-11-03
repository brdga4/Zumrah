import { apiRequest } from '../../../api/apiClient';

export function getColleges() {
  return apiRequest('/api/colleges', {
    requiresAuth: false,
  });
}

export function createCollege(collegeName) {
  return apiRequest('/api/admin/colleges', {
    method: 'POST',
    body: {
      collegeName,
    },
  });
}

export function updateCollege(collegeId, collegeName) {
  return apiRequest(`/api/admin/colleges/${collegeId}`, {
    method: 'PATCH',
    body: {
      collegeName,
    },
  });
}