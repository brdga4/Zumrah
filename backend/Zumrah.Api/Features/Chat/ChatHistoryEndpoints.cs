using Microsoft.AspNetCore.Mvc;

namespace Zumrah.Api.Features.Chat;

public static class ChatHistoryEndpoints
{
    public static IEndpointRouteBuilder MapChatHistoryEndpoints(
        this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/chat-rooms/{chatRoomId:guid}/messages", GetChatMessages)
            .RequireAuthorization("Student");

        return app;
    }


    private static async Task<IResult> GetChatMessages(
        HttpContext httpContext,
        Guid chatRoomId,
        [FromQuery] Guid? before,
        [FromQuery] int? limit,
        ChatService chatService,
        CancellationToken cancellationToken)
    {
        // Gets the student ID from the JWT
        if (!Guid.TryParse(httpContext.User.FindFirst("sub")?.Value, out Guid studentId))
        {
            return Results.Unauthorized();
        }

        // Validates the chat room ID
        if (chatRoomId == Guid.Empty)
        {
            return Results.BadRequest(new
            {
                code = "INVALID_CHAT_ROOM_ID",
                message = "A valid chat room ID is required."
            });
        }

        // Gets the messages through ChatService
        var result = await chatService.GetChatMessagesAsync(
            studentId,
            chatRoomId,
            before,
            limit ?? 50,
            cancellationToken);

        // Handles service errors
        if (result.Error is not null)
        {
            return result.Error switch
            {
                "CHAT_ROOM_NOT_FOUND" => Results.NotFound(new
                {
                    code = result.Error,
                    message = "Chat room not found."
                }),

                "CHAT_ROOM_INACTIVE" => Results.Json(new
                {
                    code = result.Error,
                    message = "This chat room is inactive."
                }, statusCode: 403),

                "CHAT_ACCESS_DENIED" => Results.Json(new
                {
                    code = result.Error,
                    message = "You do not have access to this chat room."
                }, statusCode: 403),

                "INVALID_CURSOR" => Results.BadRequest(new
                {
                    code = result.Error,
                    message = "The message cursor is invalid."
                }),

                "INVALID_LIMIT" => Results.BadRequest(new
                {
                    code = result.Error,
                    message = "The limit must be between 1 and 100."
                }),

                _ => Results.Problem("An unexpected error occurred.")
            };
        }

        // Builds the response
        var messages = result.Messages!.Select(m => new
        {
            messageId = m.MessageId,
            studentId = m.StudentId,
            studentName = m.Student.Name,
            content = m.Content,
            sentAt = DateTime.SpecifyKind(m.SentAt, DateTimeKind.Utc)
        }).ToList();

        return Results.Ok(new
        {
            messages,
            nextBefore = result.NextBefore
        });
    }
}
