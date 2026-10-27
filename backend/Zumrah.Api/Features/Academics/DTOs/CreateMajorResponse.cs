namespace Zumrah.Api.Features.Academics.DTOs;

public class CreateMajorResponse
{
    public Guid MajorId { get; set; }

    public Guid CollegeId { get; set; }

    public string MajorName { get; set; } = string.Empty;

    public Guid ChatRoomId { get; set; }

    public DateTime CreatedAt { get; set; }
}
