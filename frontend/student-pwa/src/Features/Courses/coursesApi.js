
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

// Enroll the student in a selected course 
export async function enrollInCourse(courseId) {
  // Get the student's JWT from sessionStorage
  const token = sessionStorage.getItem('accessToken');

  // Send a POST request to the backend
  const response = await fetch(`${API_BASE_URL}/api/enrollments`, {
    method: 'POST',

    // Send the JWT and specify the JSON content type
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },

    // Convert the courseId into a JSON string
    body: JSON.stringify({ courseId }),
  });

  // Check if the enrollment request failed
  if (!response.ok) {
    // Create a new JavaScript Error object
    const error = new Error('Failed to enroll in course');
    // Store the HTTP status code inside the Error object like 409 
    error.status = response.status; 
    // Pass the error to the catch block in HomePage.jsx
    throw error; 
  }

  // Return the enrollment data from the backend
  return response.json();
}

  // Unenroll the student from a selected course
export async function unenrollFromCourse(courseId) {
  // Get the student's JWT from sessionStorage
  const token = sessionStorage.getItem('accessToken');

  // Send a DELETE request to the backend
  const response = await fetch(`${API_BASE_URL}/api/enrollments/${courseId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Check if the request failed
  if (!response.ok) {
    // Create an Error object
    const error = new Error('Failed to leave course');

    // Store the HTTP status code
    error.status = response.status;

    // Pass the error to the catch block in HomePage.jsx
    throw error;
  }
}