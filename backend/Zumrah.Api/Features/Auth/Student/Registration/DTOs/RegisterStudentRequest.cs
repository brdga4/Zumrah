namespace Zumrah.Api.Features.Auth.Student.Registration.DTOs;

public class RegisterStudentRequest
{
    public string Name { get; set; } = string.Empty;

    public string UniversityEmail { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;

    public Guid MajorId { get; set; }
}
