namespace Zumrah.Api.Models;

public class Enrollment
{
    public Guid EnrollmentId { get; set; }

    public Guid StudentId { get; set; }

    public Guid CourseId { get; set; }

    public DateTime EnrolledAt { get; set; }
}
