
import { API_BASE_URL } from '../../config';

// Fetch courses available to the student's major
export async function getAvailableCourses() {

  // Get the JWT stored after login
  const token = sessionStorage.getItem('accessToken');

  // Send a GET request to the backend
  const response = await fetch(`${API_BASE_URL}/api/courses/available`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Check if the request failed
  if (!response.ok) {
    throw new Error('Failed to fetch available courses');
  }

  // Convert the JSON response into JavaScript data
  return response.json();
}

// Fetch courses the student is enrolled in
export async function getEnrolledCourses() {
  const token = sessionStorage.getItem('accessToken');

  const response = await fetch(`${API_BASE_URL}/api/courses/enrolled`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch enrolled courses');
  }

  return response.json();
}