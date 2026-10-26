using Zumrah.Api.Features.Courses.DTOs;

namespace Zumrah.Api.Features.Courses;

public static class CreateEnrollmentEndpoint
{
    public static IEndpointRouteBuilder MapCreateEnrollmentEndpoint(
        this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/enrollments", CreateEnrollment)
            .RequireAuthorization("Student");

        return app;
    }

    private static async Task<IResult> CreateEnrollment(
        HttpContext httpContext,
        CreateEnrollmentRequest request,
        CourseService courseService)
    {
        // Gets the student ID from the JWT
        if (!Guid.TryParse(httpContext.User.FindFirst("sub")?.Value, out Guid studentId))
        {
            return Results.Unauthorized();
        }

        // Validates the request
        if (request.CourseId == Guid.Empty)
        {
            return Results.BadRequest(new
            {
                code = "INVALID_COURSE_ID",
                message = "A valid course ID is required."
            });
        }

        // Attempts to create the enrollment
        var result = await courseService.CreateEnrollmentAsync(studentId, request.CourseId);

        // Handles errors returned by the service
        if (result.Error is not null)
        {
            return result.Error switch
            {
                "STUDENT_NOT_FOUND" => Results.NotFound(new
                {
                    code = result.Error,
                    message = "Student not found."
                }),

                "COURSE_NOT_FOUND" => Results.NotFound(new
                {
                    code = result.Error,
                    message = "Course not found."
                }),

                "COURSE_NOT_AVAILABLE" => Results.BadRequest(new
                {
                    code = result.Error,
                    message = "Course is not offered to your major."
                }),

                "ALREADY_ENROLLED" => Results.Conflict(new
                {
                    code = result.Error,
                    message = "You are already enrolled in this course."
                }),

                "COURSE_CHAT_ROOM_UNAVAILABLE" => Results.Json(new
                {
                    code = result.Error,
                    message = "The course chat room is unavailable."
                }, statusCode: 503),

                _ => Results.Problem("An unexpected error occurred.")
            };
        }

        // Ensures the service returned an enrollment
        if (result.Enrollment is null)
        {
            return Results.Problem("Enrollment creation failed.");
        }

        // Builds the response DTO
        var response = new CreateEnrollmentResponse
        {
            EnrollmentId = result.Enrollment.EnrollmentId,
            CourseId = result.Enrollment.CourseId,
            ChatRoomId = result.Enrollment.Course.ChatRoom!.ChatRoomId,
            EnrolledAt = result.Enrollment.EnrolledAt
        };

        return Results.Json(response, statusCode: 201);
    }
}
