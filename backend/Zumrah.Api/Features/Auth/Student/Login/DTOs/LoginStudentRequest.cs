namespace Zumrah.Api.Features.Auth.Student.Login.DTOs;

public class LoginStudentRequest
{
    public string UniversityEmail { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;
}
