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
    options.AddPolicy("StudentFrontend", policy =>
    {
        policy.WithOrigins(
                  "https://zumrah-student.pages.dev",
                  "http://localhost:5173"
              )
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors("StudentFrontend");

app.MapGet("/api/example", () => "Hello from Zumrah!");

app.Run();
