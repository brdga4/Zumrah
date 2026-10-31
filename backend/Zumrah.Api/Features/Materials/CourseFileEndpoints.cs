using Microsoft.AspNetCore.Mvc;
using Zumrah.Api.Features.Materials.DTOs;

namespace Zumrah.Api.Features.Materials;

public static class CourseFileEndpoints
{
    public static IEndpointRouteBuilder MapCourseFileEndpoints(
        this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/courses/{courseId:guid}/files", UploadFile)
            .RequireAuthorization("Student")
            .DisableAntiforgery()
            .WithMetadata(new RequestSizeLimitAttribute(11 * 1024 * 1024));

        app.MapGet("/api/files/{fileId:guid}/download", DownloadFile)
            .RequireAuthorization("Student");

        app.MapGet("/api/courses/{courseId:guid}/files", GetCourseFiles)
            .RequireAuthorization("Student");

        return app;
    }

    private static async Task<IResult> UploadFile(
        HttpContext httpContext,
        Guid courseId,
        IFormFile? file,
        FileService fileService,
        CancellationToken cancellationToken)
    {
        // Get student ID from JWT
        if (!Guid.TryParse(
            httpContext.User.FindFirst("sub")?.Value,
            out Guid studentId))
        {
            return Results.Unauthorized();
        }

        // Validate course ID
        if (courseId == Guid.Empty)
        {
            return Results.BadRequest(new
            {
                code = "INVALID_COURSE_ID",
                message = "A valid course ID is required."
            });
        }

        // Upload file through FileService
        var result = await fileService.UploadFileAsync(
            studentId,
            courseId,
            file,
            cancellationToken);

        // Handle errors
        if (result.Error is not null)
        {
            return result.Error switch
            {
                "COURSE_NOT_FOUND" => Results.NotFound(new
                {
                    code = result.Error,
                    message = "Course not found."
                }),

                "COURSE_ACCESS_DENIED" => Results.Json(new
                {
                    code = result.Error,
                    message = "You are not enrolled in this course."
                }, statusCode: 403),

                "INVALID_FILE" => Results.BadRequest(new
                {
                    code = result.Error,
                    message = "A valid file is required."
                }),

                "INVALID_FILE_NAME" => Results.BadRequest(new
                {
                    code = result.Error,
                    message = "The file name is invalid."
                }),

                "INVALID_FILE_TYPE" => Results.BadRequest(new
                {
                    code = result.Error,
                    message = "Only PDF files are allowed."
                }),

                "FILE_TOO_LARGE" => Results.BadRequest(new
                {
                    code = result.Error,
                    message = "The file must not exceed 10 MiB."
                }),

                _ => Results.Problem("An unexpected error occurred.")
            };
        }

        if (result.File is null)
        {
            return Results.Problem("File upload failed.");
        }

        // Build the response DTO
        var response = new UploadCourseFileResponse
        {
            FileId = result.File.FileId,
            CourseId = result.File.CourseId,
            FileName = result.File.FileName,
            Status = result.File.Status.ToString(),
            UploadedAt = result.File.UploadedAt
        };

        return Results.Json(response, statusCode: 201);
    }

    private static async Task<IResult> DownloadFile(
        HttpContext httpContext,
        Guid fileId,
        FileService fileService,
        CancellationToken cancellationToken)
    {
        // Get student ID from JWT
        if (!Guid.TryParse(
            httpContext.User.FindFirst("sub")?.Value,
            out Guid studentId))
        {
            return Results.Unauthorized();
        }

        // Validate file ID
        if (fileId == Guid.Empty)
        {
            return Results.BadRequest(new
            {
                code = "INVALID_FILE_ID",
                message = "A valid file ID is required."
            });
        }

        // Download file through FileService
        var result = await fileService.DownloadFileAsync(
            studentId,
            fileId,
            cancellationToken);

        // Handle errors
        if (result.Error is not null)
        {
            return result.Error switch
            {
                "FILE_NOT_FOUND" => Results.NotFound(new
                {
                    code = result.Error,
                    message = "File not found."
                }),

                "FILE_ACCESS_DENIED" => Results.Json(new
                {
                    code = result.Error,
                    message = "You do not have access to this file."
                }, statusCode: 403),

                _ => Results.Problem("An unexpected error occurred.")
            };
        }

        if (result.Content is null)
        {
            return Results.Problem("File download failed.");
        }

        // Return the actual PDF
        return Results.File(
            result.Content,
            result.ContentType ?? "application/octet-stream",
            fileDownloadName: result.FileName);
    }

    private static async Task<IResult> GetCourseFiles(
        HttpContext httpContext,
        Guid courseId,
        [FromQuery] string? search,
        FileService fileService,
        CancellationToken cancellationToken)
    {
        // Get student ID from JWT
        if (!Guid.TryParse(
            httpContext.User.FindFirst("sub")?.Value,
            out Guid studentId))
        {
            return Results.Unauthorized();
        }

        // Validate course ID
        if (courseId == Guid.Empty)
        {
            return Results.BadRequest(new
            {
                code = "INVALID_COURSE_ID",
                message = "A valid course ID is required."
            });
        }

        // Get approved course files
        var result = await fileService.GetCourseFilesAsync(
            studentId,
            courseId,
            search,
            cancellationToken);

        // Handle errors
        if (result.Error is not null)
        {
            return result.Error switch
            {
                "COURSE_NOT_FOUND" => Results.NotFound(new
                {
                    code = result.Error,
                    message = "Course not found."
                }),

                "COURSE_ACCESS_DENIED" => Results.Json(new
                {
                    code = result.Error,
                    message = "You are not enrolled in this course."
                }, statusCode: 403),

                _ => Results.Problem("An unexpected error occurred.")
            };
        }

        // Return only the metadata needed by the frontend
        var files = result.Files!.Select(f => new
        {
            fileId = f.FileId,
            fileName = f.FileName,
            uploadedAt = f.UploadedAt
        }).ToList();

        return Results.Ok(new { files });
    }
}
