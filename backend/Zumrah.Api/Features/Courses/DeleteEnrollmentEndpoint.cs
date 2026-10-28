namespace Zumrah.Api.Features.Courses;

public static class DeleteEnrollmentEndpoint
{
    public static IEndpointRouteBuilder MapDeleteEnrollmentEndpoint(
        this IEndpointRouteBuilder app)
    {
        app.MapDelete("/api/enrollments/{courseId}", DeleteEnrollment)
            .RequireAuthorization("Student");

        return app;
    }

    private static async Task<IResult> DeleteEnrollment(
        HttpContext httpContext,
        Guid courseId,
        CourseService courseService)
    {
        // Gets the student ID from the JWT
        if (!Guid.TryParse(httpContext.User.FindFirst("sub")?.Value, out Guid studentId))
        {
            return Results.Unauthorized();
        }

        // Validates the course ID
        if (courseId == Guid.Empty)
        {
            return Results.BadRequest(new
            {
                code = "INVALID_COURSE_ID",
                message = "A valid course ID is required."
            });
        }

        // Attempts to delete the enrollment
        var deleted = await courseService.DeleteEnrollmentAsync(studentId, courseId);

        // Student is not enrolled in this course
        if (!deleted)
        {
            return Results.NotFound(new
            {
                code = "ENROLLMENT_NOT_FOUND",
                message = "You are not enrolled in this course."
            });
        }

        // Enrollment successfully deleted
        return Results.NoContent();
    }
}
