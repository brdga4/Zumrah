namespace Zumrah.Api.Features.Academics.DTOs;

public class CreateCollegeResponse
{
    public Guid CollegeId { get; set; }

    public string CollegeName { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
}
