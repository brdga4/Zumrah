using Zumrah.Api.Features.Moderation.DTOs;

namespace Zumrah.Api.Features.Moderation;

public static class ReportMessageEndpoints
{
    public static IEndpointRouteBuilder MapReportMessageEndpoints(
        this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/messages/{messageId:guid}/reports", CreateReport)
            .RequireAuthorization("Student");

        return app;
    }


    private static async Task<IResult> CreateReport(
        HttpContext httpContext,
        Guid messageId,
        ReportMessageRequest request,
        ReportService reportService,
        CancellationToken cancellationToken)
    {
        // Gets the student ID from the JWT
        if (!Guid.TryParse(httpContext.User.FindFirst("sub")?.Value, out Guid studentId))
        {
            return Results.Unauthorized();
        }

        // Validates the message ID
        if (messageId == Guid.Empty)
        {
            return Results.BadRequest(new
            {
                code = "INVALID_MESSAGE_ID",
                message = "A valid message ID is required."
            });
        }

        // Creates the report through ReportService
        var result = await reportService.CreateReportAsync(
            studentId,
            messageId,
            request.Reason,
            cancellationToken);

        // Handles service errors
        if (result.Error is not null)
        {
            return result.Error switch
            {
                "MESSAGE_NOT_FOUND" => Results.NotFound(new
                {
                    code = result.Error,
                    message = "Message not found."
                }),

                "CHAT_ROOM_NOT_FOUND" => Results.NotFound(new
                {
                    code = result.Error,
                    message = "Chat room not found."
                }),

                "CHAT_ROOM_INACTIVE" or "CHAT_ACCESS_DENIED" => Results.Json(new
                {
                    code = result.Error,
                    message = "You do not have access to this chat room."
                }, statusCode: 403),

                "ALREADY_REPORTED" => Results.Conflict(new
                {
                    code = result.Error,
                    message = "You have already reported this message."
                }),

                "INVALID_REASON" => Results.BadRequest(new
                {
                    code = result.Error,
                    message = "A report reason is required."
                }),

                "REASON_TOO_LONG" => Results.BadRequest(new
                {
                    code = result.Error,
                    message = "The reason must not exceed 1000 characters."
                }),

                _ => Results.Problem("An unexpected error occurred.")
            };
        }

        if (result.Report is null)
        {
            return Results.Problem("Report creation failed.");
        }

        // Returns the created report
        var report = result.Report;

        return Results.Json(new
        {
            reportId = report.ReportId,
            messageId = report.MessageId,
            reason = report.Reason,
            status = report.Status.ToString(),
            createdAt = report.CreatedAt
        }, statusCode: 201);
    }
}
