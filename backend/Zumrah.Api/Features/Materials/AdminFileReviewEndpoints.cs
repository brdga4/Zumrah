
using Microsoft.AspNetCore.Mvc;
using Zumrah.Api.Models.Enums;

namespace Zumrah.Api.Features.Materials;

public static class AdminFileReviewEndpoints
{
    public static IEndpointRouteBuilder MapAdminFileReviewEndpoints(
        this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/admin/files", GetFiles)
            .RequireAuthorization("Admin");

        return app;
    }

    private static async Task<IResult> GetFiles(
        [FromQuery] string? status,
        AdminFileReviewService fileReviewService,
        CancellationToken cancellationToken)
    {
        FileStatus? fileStatus = null;

        if (status is not null)
        {

            if (!Enum.TryParse<FileStatus>(
                    status.Trim(),
                    true,
                    out var parsedStatus)
                || !Enum.GetNames<FileStatus>().Contains(
                    status.Trim(),
                    StringComparer.OrdinalIgnoreCase))

            {
                return Results.BadRequest(new
                {
                    code = "INVALID_FILE_STATUS",
                    message = "Status must be PENDING, APPROVED, or REJECTED."
                });
            }

            fileStatus = parsedStatus;
        }

        var response = await fileReviewService.GetFilesAsync(
            fileStatus,
            cancellationToken);

        return Results.Ok(response);
    }
}
