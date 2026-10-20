using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Identity;
using Resend;
using Zumrah.Api.Models;
using Zumrah.Api.Data;
using Zumrah.Api.Features.Auth;
using Zumrah.Api.Features;


var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration
    .GetConnectionString("DevConnection") ?? throw new InvalidOperationException(
        "Database connection string is missing."
    );

builder.Services.AddDbContext<ZumrahDbContext>(options =>
    options.UseMySQL(connectionString));

builder.Services.AddResend(options =>
{
    options.ApiToken = builder.Configuration["Resend:ApiKey"] ?? throw new InvalidOperationException(
            "Resend API key is missing."
        );
});

// JWT configuration
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? throw new InvalidOperationException(
        "JWT issuer is missing."
    );

var jwtAudience = builder.Configuration["Jwt:Audience"] ?? throw new InvalidOperationException(
        "JWT audience is missing."
    );

var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException(
        "JWT signing key is missing."
    );

var jwtKeyBytes = Convert.FromBase64String(jwtKey);

if (jwtKeyBytes.Length < 32)
{
    throw new InvalidOperationException(
        "JWT signing key must contain at least 32 bytes."
    );
}

// JWT authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false;

        options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = jwtIssuer,

                ValidateAudience = true,
                ValidAudience = jwtAudience,

                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(jwtKeyBytes),
                ValidAlgorithms = [SecurityAlgorithms.HmacSha256],

                ValidateLifetime = true,
                ClockSkew = TimeSpan.FromMinutes(1),

                NameClaimType = "sub",
                RoleClaimType = "role"
            };
    });

// Authorization policies
builder.Services.AddAuthorizationBuilder()
    .AddPolicy("Student", policy =>
        policy.RequireRole("Student"))
    .AddPolicy("Admin", policy =>
        policy.RequireRole("Admin"));

builder.Services.AddCors(options =>
{
    options.AddPolicy("ZumrahFrontends", policy =>
    {
        policy.WithOrigins(
            // Production frontends
            "https://zumrah-student.pages.dev",
            "https://zumrah-admin.pages.dev",

            // Local development frontends
            "http://localhost:5173",
            "http://localhost:5174",

            "http://127.0.0.1:5173",
            "http://127.0.0.1:5174"
        )
        .AllowAnyHeader()
        .AllowAnyMethod();
    });
});

builder.Services.AddSingleton<JwtTokenService>();
builder.Services.AddSingleton<OtpService>();

builder.Services.AddScoped<IPasswordHasher<Student>, PasswordHasher<Student>>();

var app = builder.Build();

app.UseCors("ZumrahFrontends");

app.UseAuthentication();
app.UseAuthorization();

app.MapAllEndpoints();

app.Run();
