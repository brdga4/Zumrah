import { apiRequest } from '../../../api/apiClient';

export function createMajor(collegeId, majorName) {
  return apiRequest('/api/admin/majors', {
    method: 'POST',
    body: {
      collegeId,
      majorName,
    },
  });
}

export function updateMajor(majorId, majorName) {
  return apiRequest(`/api/admin/majors/${majorId}`, {
    method: 'PATCH',
    body: {
      majorName,
    },
  });
}