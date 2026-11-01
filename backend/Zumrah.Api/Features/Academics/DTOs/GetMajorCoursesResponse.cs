
namespace Zumrah.Api.Features.Academics.DTOs;

public class GetMajorCoursesResponse
{
    public Guid MajorId { get; set; }

    public List<AdminCourseItemResponse> Courses { get; set; } = [];
}
