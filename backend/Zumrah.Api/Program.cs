using Microsoft.EntityFrameworkCore;
using Zumrah.Api.Data;


var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration
    .GetConnectionString("DefaultConnection") ?? throw new InvalidOperationException(
        "Database connection string is missing."
    );

builder.Services.AddDbContext<ZumrahDbContext>(options =>
    options.UseMySQL(connectionString));


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


var app = builder.Build();

app.UseCors("ZumrahFrontends");

app.MapGet("/api/example", async (ZumrahDbContext db) =>
{
    var email = await db.Admins
        .Where(admin => admin.Username == "admin")
        .Select(admin => admin.Email)
        .FirstOrDefaultAsync();

    if (email is null)
    {
        return Results.NotFound("Admin not found.");
    }

    return Results.Ok(new { email });
});

app.Run();
