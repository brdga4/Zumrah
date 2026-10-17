namespace Zumrah.Api.Models;

public class MajorCourse
{
    public Guid MajorCourseId { get; set; }

    public Guid MajorId { get; set; }

    public Guid CourseId { get; set; }

    public Course Course { get; set; } = null!;

    public Guid? AddedByAdminId { get; set; }

    public DateTime AddedAt { get; set; }
}
