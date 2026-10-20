namespace Zumrah.Api.Features.Auth.Student.Registration.DTOs;

public class VerifyEmailRequest
{
    public string UniversityEmail { get; set; } = string.Empty;

    public string Otp { get; set; } = string.Empty;
}
