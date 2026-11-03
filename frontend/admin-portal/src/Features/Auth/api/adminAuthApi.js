import { apiRequest } from '../../../api/apiClient';

export function loginAdmin(identifier, password) {
  return apiRequest('/api/auth/admin', {
    method: 'POST',
    requiresAuth: false,
    body: {
      identifier,
      password,
    },
  });
}