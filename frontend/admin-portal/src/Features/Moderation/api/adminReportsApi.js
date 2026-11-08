import { apiRequest } from '../../../api/apiClient';

export function getAdminReports(status = 'PENDING') {
  return apiRequest(`/api/admin/reports?status=${status}`);
}

export function getAdminReportById(reportId) {
  return apiRequest(`/api/admin/reports/${reportId}`);
}

export function reviewAdminReport(reportId, status) {
  return apiRequest(`/api/admin/reports/${reportId}`, {
    method: 'PATCH',
    body: { status },
  });
}