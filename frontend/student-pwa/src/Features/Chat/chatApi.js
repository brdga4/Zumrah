
import { API_BASE_URL } from "../../config";

// Fetch chat history for the selected room
export async function getChatHistory(chatRoomId) {
  const token = sessionStorage.getItem("accessToken");

  const response = await fetch(
    `${API_BASE_URL}/api/chat-rooms/${chatRoomId}/messages?limit=50`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch chat history");
  }

  return response.json();
}
//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Report a specific chat message
export async function reportMessage(messageId, reason) {

  // Get the student's JWT
  const token = sessionStorage.getItem("accessToken");

  // Send a POST request to create a message report
  const response = await fetch(
    `${API_BASE_URL}/api/messages/${messageId}/reports`,
    {
      method: "POST",

      // Send the JWT and specify the JSON content type
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },

      // Convert the report reason into JSON
      body: JSON.stringify({ reason }),
    }
  );

  // Check if the backend rejected the report
  if (!response.ok) {
    const error = new Error("Failed to report message");

    // Save HTTP status, especially 403, 404 and 409
    error.status = response.status;

    throw error;
  }

  // Return the created report data
  return response.json();
}
//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------