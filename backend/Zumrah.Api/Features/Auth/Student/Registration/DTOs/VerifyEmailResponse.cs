namespace Zumrah.Api.Features.Auth.Student.Registration.DTOs;

public class VerifyEmailResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public StudentResponse Student { get; set; } = new();
}

public class StudentResponse
{
    public Guid StudentId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string UniversityEmail { get; set; } = string.Empty;

    public CollegeResponse College { get; set; } = new();
    public MajorResponse Major { get; set; } = new();

    public Guid MajorChatRoomId { get; set; }
}

public class CollegeResponse
{
    public Guid CollegeId { get; set; }
    public string CollegeName { get; set; } = string.Empty;
}

public class MajorResponse
{
    public Guid MajorId { get; set; }
    public string MajorName { get; set; } = string.Empty;
}
