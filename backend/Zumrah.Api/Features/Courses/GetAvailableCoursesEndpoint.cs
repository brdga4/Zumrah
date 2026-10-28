using Zumrah.Api.Features.Courses.DTOs;

namespace Zumrah.Api.Features.Courses;

public static class GetAvailableCoursesEndpoint
{
    public static IEndpointRouteBuilder MapGetAvailableCoursesEndpoint(
        this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/courses/available", GetAvailableCourses)
            .RequireAuthorization("Student");

        return app;
    }

    private static async Task<IResult> GetAvailableCourses(
        HttpContext httpContext,
        CourseService courseService)
    {
        // Gets the student ID from the JWT
        if (!Guid.TryParse(
            httpContext.User.FindFirst("sub")?.Value,
            out Guid studentId))
        {
            return Results.Unauthorized();
        }

        // Gets available courses and enrolled course IDs
        var result = await courseService.GetAvailableCoursesAsync(studentId);

        if (result.MajorCourses is null)
        {
            return Results.NotFound(new
            {
                code = "STUDENT_NOT_FOUND",
                message = "Student not found."
            });
        }

        // Fills the response DTO
        var response = new GetAvailableCoursesResponse
        {
            Courses = result.MajorCourses.Select(mc => new AvailableCourseResponse
            {
                CourseId = mc.CourseId,
                CourseCode = mc.Course.CourseCode,
                CourseName = mc.Course.CourseName,
                IsEnrolled = result.EnrolledCourseIds.Contains(mc.CourseId)
            }).ToList()
        };

        return Results.Ok(response);
    }
}
