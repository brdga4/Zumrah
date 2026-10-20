
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Zumrah.Api.Data;
using Zumrah.Api.Features.Auth.Admin.Login.DTOs;
using AdminModel = Zumrah.Api.Models.Admin;

namespace Zumrah.Api.Features.Auth.Admin.Login;

public static class AdminLoginEndpoint
{
    public static IEndpointRouteBuilder MapAdminLoginEndpoint(
        this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/auth/admin", Login)
            .AllowAnonymous();

        return app;
    }

    private static async Task<IResult> Login(
        AdminLoginRequest request,
        ZumrahDbContext db,
        IPasswordHasher<AdminModel> passwordHasher,
        JwtTokenService jwtTokenService)
    {
        // Validate login fields
        if (string.IsNullOrWhiteSpace(request.Identifier) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            return Results.BadRequest(new
            {
                code = "INVALID_INPUT",
                message = "Identifier and password are required."
            });
        }

        // Find admin by username or email
        string identifier = request.Identifier.Trim();

        var admin = await db.Admins.FirstOrDefaultAsync(a =>
            a.Username == identifier || a.Email == identifier);

        if (admin is null)
        {
            return Results.Unauthorized();
        }

        // Verify password
        var result = passwordHasher.VerifyHashedPassword(
            admin,
            admin.PasswordHash,
            request.Password);

        if (result == PasswordVerificationResult.Failed)
        {
            return Results.Unauthorized();
        }

        // Generate admin JWT
        string token = jwtTokenService.CreateToken(
            admin.AdminId, "Admin");

        // Return login response
        var response = new AdminLoginResponse
        {
            AccessToken = token,
            Admin = new AdminResponse
            {
                AdminId = admin.AdminId,
                Username = admin.Username,
                Email = admin.Email
            }
        };

        return Results.Ok(response);
    }
}
