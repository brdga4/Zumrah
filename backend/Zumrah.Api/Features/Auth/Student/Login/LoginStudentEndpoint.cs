using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Zumrah.Api.Data;
using Zumrah.Api.Features.Auth;
using Zumrah.Api.Features.Auth.Student.Login.DTOs;
using Zumrah.Api.Features.Auth.Student.Registration.DTOs;
using StudentModel = Zumrah.Api.Models.Student;

namespace Zumrah.Api.Features.Auth.Student.Login;

public static class LoginStudentEndpoint
{
    public static IEndpointRouteBuilder MapLoginStudentEndpoint(
        this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/auth/student/login", Login)
            .AllowAnonymous();

        return app;
    }

    private static async Task<IResult> Login(
        LoginStudentRequest request,
        ZumrahDbContext db,
        IPasswordHasher<StudentModel> passwordHasher,
        JwtTokenService jwtTokenService)
    {
        string email = request.UniversityEmail.Trim().ToLowerInvariant();

        // Find student
        var student = await db.Students.SingleOrDefaultAsync(
            s => s.UniversityEmail == email);

        // Check credentials
        if (student is null ||
            passwordHasher.VerifyHashedPassword(
                student,
                student.PasswordHash,
                request.Password) == PasswordVerificationResult.Failed)
        {
            return Results.Json(new
            {
                code = "INVALID_CREDENTIALS",
                message = "Invalid university email or password."
            }, statusCode: 401);
        }

        // Get student's major, college, and chat room
        var major = await db.Majors
            .Include(m => m.College)
            .Include(m => m.ChatRoom)
            .SingleAsync(m => m.MajorId == student.MajorId);

        // Generate JWT
        string token = jwtTokenService.CreateToken(
            student.StudentId, "Student");

        // Fill the response DTO
        var response = new LoginStudentResponse
        {
            AccessToken = token,

            Student = new StudentResponse
            {
                StudentId = student.StudentId,
                Name = student.Name,
                UniversityEmail = student.UniversityEmail,

                College = new CollegeResponse
                {
                    CollegeId = major.College.CollegeId,
                    CollegeName = major.College.CollegeName
                },

                Major = new MajorResponse
                {
                    MajorId = major.MajorId,
                    MajorName = major.MajorName
                },

                MajorChatRoomId = major.ChatRoom!.ChatRoomId
            }
        };

        return Results.Ok(response);
    }
}
