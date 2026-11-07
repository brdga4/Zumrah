import { API_BASE_URL } from '../../config';

// Fetch approved files for a specific course
export async function getCourseFiles(courseId) {
  // Get the student's JWT
  const token = sessionStorage.getItem('accessToken');

  // Request the course files from the backend
  const response = await fetch(
    `${API_BASE_URL}/api/courses/${courseId}/files`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  // Check if the request failed
  if (!response.ok) {
    const error = new Error('Failed to fetch course files');
    error.status = response.status;
    throw error;
  }

  // Return the files data
  return response.json();
}
//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------


 // Export an async function to upload a file to a specific course.
 // courseId identifies the course, and file is the selected file.
 export async function uploadCourseFile(courseId, file) {

   // Get the student's JWT token stored after login.
   const token = sessionStorage.getItem("accessToken");

   // Create a FormData object to send the file to the backend.
   const formData = new FormData();

   // Add the selected file under the field name "file".
   // The backend expects this exact field name.
   formData.append("file", file);

   // Send an HTTP request and wait for the backend response.
   const response = await fetch(

     // API endpoint for uploading a file to the selected course.
     `${API_BASE_URL}/api/courses/${courseId}/files`,

     // Request configuration.
     {
       // POST is used because we are uploading a new file.
       method: "POST",

       // Send the JWT so the backend can authenticate the student.
       headers: {
         Authorization: `Bearer ${token}`,
       },

       // Send the FormData containing the selected file.
       // Do not set Content-Type manually for FormData.
       body: formData,
     }
   );

   // Check whether the backend rejected the upload.
   if (!response.ok) {

     // Create a JavaScript Error object.
     const error = new Error("Failed to upload file");

     // Save the HTTP status code, such as 400 or 403.
     error.status = response.status;

     // Stop execution and pass the error to the caller.
     throw error;
   }

   // Convert the successful JSON response into JavaScript data.
   // The uploaded file will initially have PENDING status.
   return response.json();
 }
//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------

 // Download an approved file using its unique fileId
 export async function downloadCourseFile(fileId) {

   // Get the student's JWT from sessionStorage
   const token = sessionStorage.getItem("accessToken");

   // Send a GET request to download the selected file
   const response = await fetch(
     `${API_BASE_URL}/api/files/${fileId}/download`,
     {
       headers: {
         Authorization: `Bearer ${token}`,
       },
     }
   );

   // Check whether the download request failed
   if (!response.ok) {
     const error = new Error("Failed to download file");

     // Save the HTTP status code for error handling
     error.status = response.status;

     throw error;
   }

   // Convert the response into a Blob (binary file data)
   return response.blob();
 }
//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------