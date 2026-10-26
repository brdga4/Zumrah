namespace Zumrah.Api.Features.Courses.DTOs;

public class GetAvailableCoursesResponse
{
    public List<AvailableCourseResponse> Courses { get; set; } = [];
}

public class AvailableCourseResponse
{
    public Guid CourseId { get; set; }
    public string CourseCode { get; set; } = string.Empty;
    public string CourseName { get; set; } = string.Empty;
    public bool IsEnrolled { get; set; }
}
