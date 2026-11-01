
namespace Zumrah.Api.Features.Materials.DTOs;

public class AdminFileCourseResponse
{
    public Guid CourseId { get; set; }

    public string CourseCode { get; set; } = string.Empty;

    public string CourseName { get; set; } = string.Empty;
}
