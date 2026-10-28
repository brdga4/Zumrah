namespace Zumrah.Api.Features.Students.DTOs;

public class UpdateStudentProfileRequest
{
    public string? Name { get; set; }
    public Guid? MajorId { get; set; }
}
