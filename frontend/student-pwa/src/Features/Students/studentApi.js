
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

//-----------------------------------Profile--Page---------------------------------------------------------------------------

// Update the current student's name or major
export async function updateStudentProfile(changes) {
  const token = sessionStorage.getItem("accessToken");

  const response = await fetch(`${API_BASE_URL}/api/students/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
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
