using Zumrah.Api.Features.Auth.Student.Registration.DTOs;

namespace Zumrah.Api.Features.Auth.Student.Login.DTOs;

public class LoginStudentResponse
{
    public string AccessToken { get; set; } = string.Empty;

    public StudentResponse Student { get; set; } = new();
}
