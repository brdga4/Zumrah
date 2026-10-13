var builder = WebApplication.CreateBuilder(args);

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
