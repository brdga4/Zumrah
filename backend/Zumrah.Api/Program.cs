using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Identity;
using Resend;
using Azure.Identity;
using Azure.Core;
using Microsoft.Extensions.Azure;
using Zumrah.Api.Models;
using Zumrah.Api.Data;
using Zumrah.Api.Features.Auth;
using Zumrah.Api.Features;
using Zumrah.Api.Features.Students;
using Zumrah.Api.Features.Courses;
using Zumrah.Api.Features.Academics;
using Zumrah.Api.Features.Materials;


var builder = WebApplication.CreateBuilder(args);

// Database connection
var connectionString = builder.Configuration
    .GetConnectionString("ProdConnection") ?? throw new InvalidOperationException(
        "Database connection string is missing."
    );

builder.Services.AddDbContext<ZumrahDbContext>(options =>
    options.UseMySQL(connectionString));


// Resend configuration
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


// Azure Blob Storage configuration
var storageAccountName = builder.Configuration["BlobStorage:AccountName"]
    ?? throw new InvalidOperationException("Blob storage account name is missing.");

builder.Services.AddAzureClients(clientBuilder =>
{
    clientBuilder.AddBlobServiceClient(
        new Uri($"https://{storageAccountName}.blob.core.windows.net"));

    TokenCredential credential = builder.Environment.IsDevelopment()
        ? new AzureCliCredential()
        : new ManagedIdentityCredential(ManagedIdentityId.SystemAssigned);

    clientBuilder.UseCredential(credential);
});

// Cors policies
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

// Register services for DI
builder.Services.AddSingleton<JwtTokenService>();
builder.Services.AddSingleton<OtpService>();
builder.Services.AddScoped<BlobStorageService>();

builder.Services.AddScoped<IPasswordHasher<Student>, PasswordHasher<Student>>();
builder.Services.AddScoped<IPasswordHasher<Admin>, PasswordHasher<Admin>>();

builder.Services.AddScoped<StudentService>();
builder.Services.AddScoped<AcademicManagementService>();
builder.Services.AddScoped<CourseService>();
builder.Services.AddScoped<FileService>();

var app = builder.Build();

app.UseCors("ZumrahFrontends");

app.UseAuthentication();
app.UseAuthorization();

app.MapAllEndpoints();

app.Run();
