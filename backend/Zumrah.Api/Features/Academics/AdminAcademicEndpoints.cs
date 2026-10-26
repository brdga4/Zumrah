using Zumrah.Api.Features.Academics.DTOs;

namespace Zumrah.Api.Features.Academics;

public static class AdminAcademicEndpoints
{
    public static IEndpointRouteBuilder MapAdminAcademicEndpoints(
        this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/admin/colleges", CreateCollege)
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
}
