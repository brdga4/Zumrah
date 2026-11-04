import { API_BASE_URL } from '../../../config';
import { apiRequest } from '../../../api/apiClient';

export function getPendingAdminFiles() {
  return apiRequest('/api/admin/files?status=PENDING');
}

export function getAdminFileById(fileId) {
  return apiRequest(`/api/admin/files/${fileId}`);
}

export function reviewAdminFile(fileId, status) {
  return apiRequest(`/api/admin/files/${fileId}`, {
    method: 'PATCH',
    body: {
      status,
    },
  });
}

export async function downloadAdminFile(fileId) {
  const accessToken = sessionStorage.getItem('accessToken');

  const response = await fetch(
    `${API_BASE_URL}/api/admin/files/${fileId}/download`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error('تعذر تنزيل الملف.');
  }

  return response.blob();
}