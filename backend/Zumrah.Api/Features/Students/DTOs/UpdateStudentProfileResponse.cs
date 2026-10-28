using Zumrah.Api.Features.Auth.Student.Registration.DTOs;

namespace Zumrah.Api.Features.Students.DTOs;

public class UpdateStudentProfileResponse
{
    public Guid StudentId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string UniversityEmail { get; set; } = string.Empty;

    public CollegeResponse College { get; set; } = new();
    public MajorResponse Major { get; set; } = new();

    public Guid MajorChatRoomId { get; set; }
}
