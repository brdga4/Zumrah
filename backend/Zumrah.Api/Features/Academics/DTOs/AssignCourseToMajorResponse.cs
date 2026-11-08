
namespace Zumrah.Api.Features.Academics.DTOs;

public class AssignCourseToMajorResponse
{
    public Guid MajorCourseId { get; set; }

    public Guid MajorId { get; set; }

    public Guid CourseId { get; set; }

    public DateTime AddedAt { get; set; }
}
