using Zumrah.Api.Features.Auth.Student.Registration.DTOs;
using Zumrah.Api.Features.Students.DTOs;

namespace Zumrah.Api.Features.Students;

public static class GetStudentProfileEndpoint
{
    public static IEndpointRouteBuilder MapStudentProfileEndpoints(
        this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/students/me", GetProfile)
            .RequireAuthorization("Student");

        app.MapPatch("/api/students/me", UpdateProfile)
            .RequireAuthorization("Student");

        return app;
    }

    private static async Task<IResult> GetProfile(
        HttpContext httpContext,
        StudentService studentService)
    {
        // Gets the student ID from the JWT
        if (!Guid.TryParse(
            httpContext.User.FindFirst("sub")?.Value,
            out Guid studentId))
        {
            return Results.Unauthorized();
        }

        // Gets the student's profile using StudentService
        var student = await studentService.GetProfileAsync(studentId);

        if (student is null)
        {
            return Results.NotFound(new
            {
                code = "STUDENT_NOT_FOUND",
                message = "Student not found."
            });
        }

        // Checks if the student's major has a chat room
        if (student.Major.ChatRoom is null)
        {
            return Results.Json(new
            {
                code = "MAJOR_CHAT_ROOM_MISSING",
                message = "The student's major has no chat room."
            }, statusCode: 503);
        }

        // Fills the response DTO
        var response = new GetStudentProfileResponse
        {
            StudentId = student.StudentId,
            Name = student.Name,
            UniversityEmail = student.UniversityEmail,

            College = new CollegeResponse
            {
                CollegeId = student.Major.College.CollegeId,
                CollegeName = student.Major.College.CollegeName
            },

            Major = new MajorResponse
            {
                MajorId = student.Major.MajorId,
                MajorName = student.Major.MajorName
            },

            MajorChatRoomId = student.Major.ChatRoom.ChatRoomId
        };

        return Results.Ok(response);
    }


    private static async Task<IResult> UpdateProfile(
        UpdateStudentProfileRequest request,
        HttpContext httpContext,
        StudentService studentService)
    {
        // Gets the student ID from the JWT
        if (!Guid.TryParse(httpContext.User.FindFirst("sub")?.Value, out Guid studentId))
        {
            return Results.Unauthorized();
        }

        // Validates the name if provided
        if (request.Name is not null && (string.IsNullOrWhiteSpace(request.Name) || request.Name.Trim().Length > 100))
        {
            return Results.BadRequest(new
            {
                code = "INVALID_NAME",
                message = "Name cannot be empty and cannot exceed 100 characters."
            });
        }

        // Updates the profile using StudentService
        var result = await studentService.UpdateProfileAsync(studentId, request.Name, request.MajorId);

        if (result.Error == "MAJOR_NOT_FOUND")
        {
            return Results.NotFound(new
            {
                code = "MAJOR_NOT_FOUND",
                message = "The selected major does not exist."
            });
        }

        if (result.Error == "MAJOR_CHAT_ROOM_MISSING")
        {
            return Results.Json(new
            {
                code = "MAJOR_CHAT_ROOM_MISSING",
                message = "The selected major has no chat room."
            }, statusCode: 503);
        }

        var student = result.Student;

        if (student is null)
        {
            return Results.NotFound(new
            {
                code = "STUDENT_NOT_FOUND",
                message = "Student not found."
            });
        }

        // Fills the response DTO
        var response = new UpdateStudentProfileResponse
        {
            StudentId = student.StudentId,
            Name = student.Name,
            UniversityEmail = student.UniversityEmail,

            College = new CollegeResponse
            {
                CollegeId = student.Major.College.CollegeId,
                CollegeName = student.Major.College.CollegeName
            },

            Major = new MajorResponse
            {
                MajorId = student.Major.MajorId,
                MajorName = student.Major.MajorName
            },

            MajorChatRoomId = student.Major.ChatRoom!.ChatRoomId
        };

        return Results.Ok(response);
    }
}
