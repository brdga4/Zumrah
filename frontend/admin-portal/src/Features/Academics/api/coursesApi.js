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

export function getMajorCourses(majorId) {
  return apiRequest(`/api/admin/majors/${majorId}/courses`);
}

export function assignCourseToMajor(majorId, courseId) {
  return apiRequest(`/api/admin/majors/${majorId}/courses`, {
    method: 'POST',
    body: {
      courseId,
    },
  });
}


export function updateCourse(courseId, courseCode, courseName) {
  return apiRequest(`/api/admin/courses/${courseId}`, {
    method: 'PATCH',
    body: {
      courseCode,
      courseName,
    },
  });
}



