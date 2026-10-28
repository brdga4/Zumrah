namespace Zumrah.Api.Features.Courses.DTOs;

public class GetEnrolledCoursesResponse
{
    public List<EnrolledCourseResponse> Courses { get; set; } = [];
}

public class EnrolledCourseResponse
{
    public Guid CourseId { get; set; }
    public string CourseCode { get; set; } = string.Empty;
    public string CourseName { get; set; } = string.Empty;
    public Guid ChatRoomId { get; set; }
    public DateTime EnrolledAt { get; set; }
}
