
using Microsoft.AspNetCore.Mvc;
using Zumrah.Api.Models.Enums;

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
}
