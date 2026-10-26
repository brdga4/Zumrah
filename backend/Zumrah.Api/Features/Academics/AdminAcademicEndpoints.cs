
using Zumrah.Api.Features.Academics.DTOs;

namespace Zumrah.Api.Features.Academics;

public static class AdminAcademicEndpoints
{
    public static IEndpointRouteBuilder MapAdminAcademicEndpoints(
        this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/admin/colleges", CreateCollege)
            .RequireAuthorization("Admin");

        app.MapPatch("/api/admin/colleges/{collegeId}", UpdateCollege)
            .RequireAuthorization("Admin");

        return app;
    }

    private static async Task<IResult> CreateCollege(
        CreateCollegeRequest request,
        HttpContext httpContext,
        AcademicManagementService service)
    {
        if (!Guid.TryParse(
            httpContext.User.FindFirst("sub")?.Value,
            out Guid adminId))
        {
            return Results.Unauthorized();
        }

        try
        {
            var college = await service.CreateCollegeAsync(
                request.CollegeName ?? string.Empty,
                adminId);

            if (college is null)
            {
                return Results.Conflict(new
                {
                    code = "COLLEGE_ALREADY_EXISTS",
                    message = "College already exists."
                });
            }

            return Results.Json(
                college,
                statusCode: StatusCodes.Status201Created);
        }
        catch (ArgumentException)
        {
            return Results.BadRequest(new
            {
                code = "INVALID_COLLEGE_NAME",
                message = "College name must be between 1 and 200 characters."
            });
        }
    }

    private static async Task<IResult> UpdateCollege(
        string collegeId,
        UpdateCollegeRequest request,
        HttpContext httpContext,
        AcademicManagementService service)
    {
        if (!Guid.TryParse(collegeId, out Guid parsedCollegeId))
        {
            return Results.BadRequest(new
            {
                code = "INVALID_COLLEGE_ID",
                message = "Invalid college ID."
            });
        }

        if (!Guid.TryParse(
            httpContext.User.FindFirst("sub")?.Value,
            out Guid adminId))
        {
            return Results.Unauthorized();
        }

        try
        {
            var result = await service.UpdateCollegeAsync(
                parsedCollegeId,
                request.CollegeName ?? string.Empty,
                adminId);

            if (result.Duplicate)
            {
                return Results.Conflict(new
                {
                    code = "COLLEGE_ALREADY_EXISTS",
                    message = "College already exists."
                });
            }

            if (result.College is null)
            {
                return Results.NotFound(new
                {
                    code = "COLLEGE_NOT_FOUND",
                    message = "College not found."
                });
            }

            return Results.Ok(new
            {
                collegeId = result.College.CollegeId,
                collegeName = result.College.CollegeName,
                updatedAt = result.College.UpdatedAt
            });
        }
        catch (ArgumentException)
        {
            return Results.BadRequest(new
            {
                code = "INVALID_COLLEGE_NAME",
                message = "College name must be between 1 and 200 characters."
            });
        }
    }
}
