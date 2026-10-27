namespace Zumrah.Api.Features.Academics.DTOs;

public class CreateCourseResponse
{
    public Guid CourseId { get; set; }

    public string CourseCode { get; set; } = string.Empty;

    public string CourseName { get; set; } = string.Empty;

    public Guid ChatRoomId { get; set; }

    public DateTime CreatedAt { get; set; }
}
