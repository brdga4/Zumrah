import * as signalR from "@microsoft/signalr";
import { API_BASE_URL } from "../../config";


// Create a real-time chat connection using the student's JWT
export function createChatConnection() {
  return new signalR.HubConnectionBuilder()
    .withUrl(`${API_BASE_URL}/hubs/chat`, {
      accessTokenFactory: () =>
        sessionStorage.getItem("accessToken") || "",
    })
    .withAutomaticReconnect()
    .build();
}