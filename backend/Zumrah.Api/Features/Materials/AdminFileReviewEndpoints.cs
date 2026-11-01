
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

        app.MapGet("/api/admin/files/{fileId}", GetFileById)
            .RequireAuthorization("Admin");


        app.MapGet("/api/admin/files/{fileId:guid}/download", DownloadFile)
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

    private static async Task<IResult> GetFileById(
        Guid fileId,
        AdminFileReviewService fileReviewService,
        CancellationToken cancellationToken)
    {
        if (fileId == Guid.Empty)
        {
            return Results.BadRequest(new
            {
                code = "INVALID_FILE_ID",
                message = "A valid file ID is required."
            });
        }

        var file = await fileReviewService.GetFileByIdAsync(
            fileId,
            cancellationToken);

        if (file is null)
        {
            return Results.NotFound(new
            {
                code = "FILE_NOT_FOUND",
                message = "File not found."
            });
        }

        return Results.Ok(file);
    }

    private static async Task<IResult> DownloadFile(
        Guid fileId,
        AdminFileReviewService fileReviewService,
        CancellationToken cancellationToken)
    {
        if (fileId == Guid.Empty)
        {
            return Results.BadRequest(new
            {
                code = "INVALID_FILE_ID",
                message = "A valid file ID is required."
            });
        }

        var result = await fileReviewService.DownloadFileAsync(
            fileId,
            cancellationToken);

        if (result.Error == "FILE_NOT_FOUND")
        {
            return Results.NotFound(new
            {
                code = "FILE_NOT_FOUND",
                message = "File not found."
            });
        }

        if (result.Content is null)
        {
            return Results.Problem("File download failed.");
        }

        return Results.File(
            result.Content,
            "application/pdf",
            fileDownloadName: result.FileName);
    }


}
