
import { API_BASE_URL } from '../../config';
import { authenticatedFetch } from '../../api/apiClient.js';

// Function to fetch the authenticated student's profile
export async function getStudentProfile() {

  // Send an HTTP GET request to the backend
  const response = await authenticatedFetch(`${API_BASE_URL}/api/students/me`);

  // Check if the server returned an error
  if (!response.ok) {
    throw new Error('Failed to fetch student profile');
  }

  // Convert the response body from JSON into a JavaScript value
  return response.json();
}

//-----------------------------------Profile--Page---------------------------------------------------------------------------

// Update the current student's name or major
export async function updateStudentProfile(changes) {
  const response = await authenticatedFetch(`${API_BASE_URL}/api/students/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(changes),
  });

  if (!response.ok) {
    const error = new Error("Failed to update student profile");
    error.status = response.status;
    throw error;
  }

  return response.json();
}


// -----------------------------------------------------------------------------------------------------------------

 

// Fetch all colleges and their associated majors.
export async function getColleges() {
  const response = await fetch(`${API_BASE_URL}/api/colleges`);

  if (!response.ok) {
    throw new Error("Failed to load colleges");
  }

  const data = await response.json();
  return data.colleges ?? [];
}
