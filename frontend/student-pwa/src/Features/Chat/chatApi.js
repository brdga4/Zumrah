
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