
import { API_BASE_URL } from '../../config';
import { authenticatedFetch } from '../../api/apiClient.js';

// Fetch courses available to the student's major
export async function getAvailableCourses() {

  // Send a GET request to the backend
  const response = await authenticatedFetch(`${API_BASE_URL}/api/courses/available`);

  // Check if the request failed
  if (!response.ok) {
    throw new Error('Failed to fetch available courses');
  }

  // Convert the JSON response into JavaScript data
  return response.json();
}

// Fetch courses the student is enrolled in
export async function getEnrolledCourses() {
  const response = await authenticatedFetch(`${API_BASE_URL}/api/courses/enrolled`);

  if (!response.ok) {
    throw new Error('Failed to fetch enrolled courses');
  }

  return response.json();
}

// Enroll the student in a selected course 
export async function enrollInCourse(courseId) {
  // Send a POST request to the backend
  const response = await authenticatedFetch(`${API_BASE_URL}/api/enrollments`, {
    method: 'POST',

    // Specify the JSON content type
    headers: {
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
  // Send a DELETE request to the backend
  const response = await authenticatedFetch(`${API_BASE_URL}/api/enrollments/${courseId}`, {
    method: 'DELETE',
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