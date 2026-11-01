
using Microsoft.AspNetCore.Mvc;
using Zumrah.Api.Models.Enums;
using Zumrah.Api.Features.Moderation.DTOs;


namespace Zumrah.Api.Features.Moderation;

public static class AdminModerationEndpoints
{
    public static IEndpointRouteBuilder MapAdminModerationEndpoints(
        this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/admin/reports", GetReports)
            .RequireAuthorization("Admin");

        app.MapGet("/api/admin/reports/{reportId:guid}", GetReportById)
            .RequireAuthorization("Admin");


        app.MapPatch("/api/admin/reports/{reportId:guid}", ReviewReport)
            .RequireAuthorization("Admin");


        return app;
    }

    private static async Task<IResult> GetReports(
        [FromQuery] string? status,
        AdminModerationService moderationService,
        CancellationToken cancellationToken)
    {
        ReportStatus? reportStatus = null;

        if (status is not null)
        {
            var requestedStatus = status.Trim();

            if (!Enum.TryParse<ReportStatus>(
                    requestedStatus,
                    true,
                    out var parsedStatus)
                || !Enum.GetNames<ReportStatus>().Contains(
                    requestedStatus,
                    StringComparer.OrdinalIgnoreCase))
            {
                return Results.BadRequest(new
                {
                    code = "INVALID_REPORT_STATUS",
                    message = "Status must be PENDING, DISMISSED, or MESSAGE_REMOVED."
                });
            }

            reportStatus = parsedStatus;
        }

        var response = await moderationService.GetReportsAsync(
            reportStatus,
            cancellationToken);

        return Results.Ok(response);
    }

    private static async Task<IResult> GetReportById(
        Guid reportId,
        AdminModerationService moderationService,
        CancellationToken cancellationToken)
    {
        if (reportId == Guid.Empty)
        {
            return Results.BadRequest(new
            {
                code = "INVALID_REPORT_ID",
                message = "A valid report ID is required."
            });
        }

        var report = await moderationService.GetReportByIdAsync(
            reportId,
            cancellationToken);

        if (report is null)
        {
            return Results.NotFound(new
            {
                code = "REPORT_NOT_FOUND",
                message = "Report not found."
            });
        }

        return Results.Ok(report);
    }

    private static async Task<IResult> ReviewReport(
        Guid reportId,
        ReviewAdminReportRequest request,
        HttpContext httpContext,
        AdminModerationService moderationService,
        CancellationToken cancellationToken)
    {
        if (reportId == Guid.Empty)
        {
            return Results.BadRequest(new
            {
                code = "INVALID_REPORT_ID",
                message = "A valid report ID is required."
            });
        }

        if (!Guid.TryParse(
            httpContext.User.FindFirst("sub")?.Value,
            out Guid adminId) || adminId == Guid.Empty)
        {
            return Results.Unauthorized();
        }

        var requestedStatus = request.Status?.Trim();

        ReportStatus newStatus;

        if (string.Equals(
            requestedStatus,
            "DISMISSED",
            StringComparison.OrdinalIgnoreCase))
        {
            newStatus = ReportStatus.DISMISSED;
        }
        else if (string.Equals(
            requestedStatus,
            "MESSAGE_REMOVED",
            StringComparison.OrdinalIgnoreCase))
        {
            newStatus = ReportStatus.MESSAGE_REMOVED;
        }
        else
        {
            return Results.BadRequest(new
            {
                code = "INVALID_REPORT_STATUS",
                message = "Status must be DISMISSED or MESSAGE_REMOVED."
            });
        }

        var result = await moderationService.ReviewReportAsync(
            reportId,
            adminId,
            newStatus,
            cancellationToken);

        if (result.Error == "REPORT_NOT_FOUND")
        {
            return Results.NotFound(new
            {
                code = "REPORT_NOT_FOUND",
                message = "Report not found."
            });
        }

        if (result.Error == "REPORT_ALREADY_REVIEWED")
        {
            return Results.Conflict(new
            {
                code = "REPORT_ALREADY_REVIEWED",
                message = "Report has already been reviewed."
            });
        }

        if (result.Error is not null)
        {
            return Results.BadRequest(new
            {
                code = result.Error,
                message = "Invalid report review request."
            });
        }

        return Results.Ok(result.Response);
    }

}
