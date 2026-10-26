using Zumrah.Api.Features.Courses.DTOs;

namespace Zumrah.Api.Features.Courses;

public static class GetEnrolledCoursesEndpoint
{
    public static IEndpointRouteBuilder MapGetEnrolledCoursesEndpoint(
        this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/courses/enrolled", GetEnrolledCourses)
            .RequireAuthorization("Student");

        return app;
    }

    private static async Task<IResult> GetEnrolledCourses(
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

        // Gets the student's enrollments
        var enrollments = await courseService.GetEnrolledCoursesAsync(studentId);

        if (enrollments is null)
        {
            return Results.NotFound(new
            {
                code = "STUDENT_NOT_FOUND",
                message = "Student not found."
            });
        }

        // Checks whether any enrolled course has no chat room
        if (enrollments.Any(e => e.Course.ChatRoom is null))
        {
            return Results.Json(new
            {
                code = "COURSE_CHAT_ROOM_MISSING",
                message = "An enrolled course has no chat room."
            }, statusCode: 503);
        }

        // Fills the response DTO
        var response = new GetEnrolledCoursesResponse
        {
            Courses = enrollments.Select(e => new EnrolledCourseResponse
            {
                CourseId = e.CourseId,
                CourseCode = e.Course.CourseCode,
                CourseName = e.Course.CourseName,
                ChatRoomId = e.Course.ChatRoom!.ChatRoomId,
                EnrolledAt = e.EnrolledAt
            }).ToList()
        };

        return Results.Ok(response);
    }
}
