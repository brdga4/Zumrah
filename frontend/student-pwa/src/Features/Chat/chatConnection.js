import * as signalR from "@microsoft/signalr";


// Create a real-time chat connection using the student's JWT
export function createChatConnection() {
  return new signalR.HubConnectionBuilder()
    .withUrl("/hubs/chat", {
      accessTokenFactory: () =>
        sessionStorage.getItem("accessToken") || "",
    })
    .withAutomaticReconnect()
    .build();
}