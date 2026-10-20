using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Resend;
using System.Text.RegularExpressions;
using Zumrah.Api.Data;
using Zumrah.Api.Features.Auth;
using Zumrah.Api.Features.Auth.Student.Registration.DTOs;
using Zumrah.Api.Models;
using StudentModel = Zumrah.Api.Models.Student;

namespace Zumrah.Api.Features.Auth.Student.Registration;

public static class RegisterStudentEndpoint
{
    private const string _EmailPattern = @"^[0-9]+@student\.ksu\.edu\.sa$";
    public static IEndpointRouteBuilder MapRegisterStudentEndpoint(
        this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/auth/student/register", Register)
            .AllowAnonymous();

        app.MapPost("/api/auth/student/verify-email", VerifyEmail)
            .AllowAnonymous();

        return app;
    }

    private static async Task<IResult> Register(
        RegisterStudentRequest request,
        ZumrahDbContext db,
        OtpService otpService,
        IPasswordHasher<StudentModel> passwordHasher,
        IResend resend)
    {
        string email = request.UniversityEmail.Trim().ToLowerInvariant();

        // Email Regex
        if (!Regex.IsMatch(email, _EmailPattern))
        {
            return Results.BadRequest(new
            {
                code = "INVALID_EMAIL",
                message = "A valid KSU student email is required."
            });
        }

        DateTime now = DateTime.UtcNow;

        // Checks for existing account
        if (await db.Students.AnyAsync(s => s.UniversityEmail == email))
        {
            return Results.Conflict(new
            {
                code = "EMAIL_ALREADY_REGISTERED",
                message = "This university email is already registered."
            });
        }

        // Checks for pending registrations
        var pendingReg = await db.PendingRegistrations.SingleOrDefaultAsync(p => p.UniversityEmail == email);

        if (pendingReg is null)
        {
            pendingReg = new PendingRegistration
            {
                PendingRegistrationId = Guid.NewGuid(),
                UniversityEmail = email
            };

            db.PendingRegistrations.Add(pendingReg);
        }

        // Generates an OTP
        string otp = otpService.GenerateCode();

        // Replaces all registration information
        pendingReg.Name = request.Name.Trim();
        pendingReg.UniversityEmail = email;
        pendingReg.PasswordHash = passwordHasher.HashPassword(new StudentModel(), request.Password);
        pendingReg.MajorId = request.MajorId;

        pendingReg.OtpHash = otpService.HashCode(
            pendingReg.PendingRegistrationId, email, otp);

        pendingReg.OtpExpiresAt = now.AddMinutes(10);
        pendingReg.FailedAttempts = 0;
        pendingReg.LastOtpSentAt = now;
        pendingReg.CreatedAt = now;

        await db.SaveChangesAsync();

        // Sends the new OTP
        var message = new EmailMessage
        {
            From = "Zumrah <verify@zumrah.tech>",
            Subject = "Your Zumrah verification code",
            TextBody = $"Your verification code is {otp}. It expires in 10 minutes."
        };

        message.To.Add(email);

        var response = await resend.EmailSendAsync(message);

        if (!response.Success)
        {
            return Results.StatusCode(503);
        }

        return Results.Accepted(value: new
        {
            message = "Registration pending. Check your university email for the verification code.",
            expiresInSeconds = 600
        });
    }


    private static async Task<IResult> VerifyEmail(
        VerifyEmailRequest request,
        ZumrahDbContext db,
        OtpService otpService,
        JwtTokenService jwtTokenService)
    {
        string email = request.UniversityEmail.Trim().ToLowerInvariant();

        var pending = await db.PendingRegistrations.SingleAsync(p => p.UniversityEmail == email);

        // Verify the OTP
        if (DateTime.UtcNow >= pending.OtpExpiresAt ||
            !otpService.VerifyCode(
                pending.PendingRegistrationId,
                email,
                request.Otp,
                pending.OtpHash))
        {
            return Results.BadRequest(new
            {
                code = "INVALID_OTP",
                message = "Invalid or expired verification code."
            });
        }

        // Gets the student's major, college, and chat room
        var major = await db.Majors
            .Include(m => m.College)
            .Include(m => m.ChatRoom)
            .SingleAsync(m => m.MajorId == pending.MajorId);

        // Creates the verified student
        var student = new StudentModel
        {
            StudentId = Guid.NewGuid(),
            UniversityEmail = pending.UniversityEmail,
            Name = pending.Name,
            PasswordHash = pending.PasswordHash,
            MajorId = pending.MajorId,
            CreatedAt = DateTime.UtcNow
        };

        db.Students.Add(student);
        db.PendingRegistrations.Remove(pending);

        await db.SaveChangesAsync();

        // Generates JWT
        string token = jwtTokenService.CreateToken(
            student.StudentId, "Student");

        // Fills the response DTO
        var response = new VerifyEmailResponse
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

        return Results.Json(response, statusCode: 201);
    }
}