import { API_BASE_URL } from '../config';

export async function apiRequest(
  path,
  {
    method = 'GET',
    body,
    requiresAuth = true,
  } = {},
) {
  const headers = {};

  if (requiresAuth) {
    const accessToken = sessionStorage.getItem('accessToken');

    if (!accessToken) {
      const error = new Error('انتهت جلسة الدخول. سجل الدخول مجددًا.');
      error.status = 401;

      throw error;
    }

    headers.Authorization = `Bearer ${accessToken}`;
  }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const contentType = response.headers.get('content-type') || '';

  const data = contentType.includes('application/json')
    ? await response.json()
    : null;

  if (!response.ok) {
    const error = new Error(data?.message || 'تعذر تنفيذ الطلب.');
    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
}