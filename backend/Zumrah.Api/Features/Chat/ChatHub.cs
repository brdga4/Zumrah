using System.Collections.Concurrent;
using Microsoft.AspNetCore.SignalR;

namespace Zumrah.Api.Features.Chat;

public class ChatHub : Hub
{
    // Maps each active SignalR connection to its authenticated student.
    private static readonly ConcurrentDictionary<string, Guid> ConnectedStudents = new();

    private readonly ChatService _chatService;

    public ChatHub(ChatService chatService)
    {
        _chatService = chatService;
    }

    public override async Task OnConnectedAsync()
    {
        if (Guid.TryParse(Context.User?.FindFirst("sub")?.Value, out Guid studentId))
        {
            ConnectedStudents[Context.ConnectionId] = studentId;
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        ConnectedStudents.TryRemove(Context.ConnectionId, out _);
        await base.OnDisconnectedAsync(exception);
    }

    // Removes all currently connected sessions for a student from these rooms.
    public static async Task RevokeRoomAccessAsync(
        IHubContext<ChatHub> hubContext,
        Guid studentId,
        IEnumerable<Guid> chatRoomIds)
    {
        var connectionIds = ConnectedStudents
            .Where(entry => entry.Value == studentId)
            .Select(entry => entry.Key)
            .ToArray();

        foreach (var roomId in chatRoomIds.Distinct())
        {
            var groupName = roomId.ToString("D");

            foreach (var connectionId in connectionIds)
            {
                await hubContext.Groups.RemoveFromGroupAsync(connectionId, groupName);

                // For UI updates only. Removing group membership above
                // is what stops future room broadcasts to this connection.
                await hubContext.Clients.Client(connectionId)
                    .SendAsync("ChatAccessRevoked", new { chatRoomId = roomId });
            }
        }
    }

    public async Task JoinRoom(Guid chatRoomId)
    {
        // Gets the student ID from the authenticated connection
        if (!Guid.TryParse(Context.User?.FindFirst("sub")?.Value, out Guid studentId))
        {
            throw new HubException("UNAUTHORIZED");
        }

        // Checks whether the student can access the chat room
        var result = await _chatService.GetChatRoomAsync(studentId, chatRoomId, Context.ConnectionAborted);

        if (result.Error is not null)
        {
            throw new HubException(result.Error);
        }

        // Adds the current connection to the chat room group
        var groupName = chatRoomId.ToString("D");

        await Groups.AddToGroupAsync(Context.ConnectionId, groupName, Context.ConnectionAborted);

        // Recheck access after joining in case enrollment changed.
        var accessAfterJoin = await _chatService.GetChatRoomAsync(
            studentId, chatRoomId, Context.ConnectionAborted);

        if (accessAfterJoin.Error is not null)
        {
            await Groups.RemoveFromGroupAsync(
                Context.ConnectionId, groupName, Context.ConnectionAborted);

            throw new HubException(accessAfterJoin.Error);
        }
    }

    public async Task LeaveRoom(Guid chatRoomId)
    {
        // Removes the current connection from the group
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, chatRoomId.ToString("D"));
    }

    public async Task SendMessage(Guid chatRoomId, string? content)
    {
        // Gets the student ID from the authenticated connection
        if (!Guid.TryParse(Context.User?.FindFirst("sub")?.Value, out Guid studentId))
        {
            throw new HubException("UNAUTHORIZED");
        }

        // Saves the message through ChatService
        var result = await _chatService.SendMessageAsync(
            studentId,
            chatRoomId,
            content,
            Context.ConnectionAborted);

        // Handles service errors
        if (result.Error is not null)
        {
            var errorMessage = result.Error switch
            {
                "CHAT_ROOM_NOT_FOUND" => "Chat room not found.",
                "CHAT_ROOM_INACTIVE" => "This chat room is inactive.",
                "CHAT_ACCESS_DENIED" => "You do not have access to this chat room.",
                "STUDENT_NOT_FOUND" => "Student not found.",
                "INVALID_MESSAGE" => "Message cannot be empty.",
                "MESSAGE_TOO_LONG" => "Message exceeds 2000 characters.",
                _ => "Message could not be sent."
            };

            await Clients.Caller.SendAsync("MessageRejected", new
            {
                code = result.Error,
                message = errorMessage
            }, Context.ConnectionAborted);

            return;
        }

        if (result.Message is null)
        {
            throw new HubException("Message could not be sent.");
        }

        // Broadcasts the saved message to the chat room
        var message = result.Message;

        await Clients.Group(chatRoomId.ToString("D"))
            .SendAsync("ReceiveMessage", new
            {
                messageId = message.MessageId,
                chatRoomId = message.ChatRoomId,
                studentId = message.StudentId,
                studentName = result.StudentName,
                content = message.Content,
                sentAt = message.SentAt
            });
    }
}
