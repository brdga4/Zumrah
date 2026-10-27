
import { API_BASE_URL } from '../../config';

// Function to fetch the authenticated student's profile
export async function getStudentProfile() {

  // Get the JWT stored after login or OTP verification
  const token = sessionStorage.getItem('accessToken');

  // Send an HTTP GET request to the backend
  const response = await fetch(`${API_BASE_URL}/api/students/me`, {
    headers: {
      // Send the JWT to authenticate the student
      Authorization: `Bearer ${token}`,
    },
  });

  // Check if the server returned an error
  if (!response.ok) {
    throw new Error('Failed to fetch student profile');
  }

  // Convert the response body from JSON into a JavaScript value
  return response.json();
}
