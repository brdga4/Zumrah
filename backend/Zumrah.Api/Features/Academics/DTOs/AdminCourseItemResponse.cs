namespace Zumrah.Api.Features.Academics.DTOs;

public class AdminCourseItemResponse
{
    public Guid CourseId { get; set; }

    public string CourseCode { get; set; } = string.Empty;

    public string CourseName { get; set; } = string.Empty;
}
