namespace Zumrah.Api.Features.Academics.DTOs;

public class CreateMajorRequest
{
    public Guid CollegeId { get; set; }

    public string? MajorName { get; set; }
}
