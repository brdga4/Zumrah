import { apiRequest } from '../../../api/apiClient';

export function getCourses() {
  return apiRequest('/api/admin/courses');
}

export function createCourse(courseCode, courseName) {
  return apiRequest('/api/admin/courses', {
    method: 'POST',
    body: {
      courseCode,
      courseName,
    },
  });
}