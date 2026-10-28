namespace Zumrah.Api.Features.Courses.DTOs;

public class CreateEnrollmentRequest
{
    public Guid CourseId { get; set; }
}

public class CreateEnrollmentResponse
{
    public Guid EnrollmentId { get; set; }
    public Guid CourseId { get; set; }
    public Guid ChatRoomId { get; set; }
    public DateTime EnrolledAt { get; set; }
}
