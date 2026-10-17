namespace Zumrah.Api.Models;

public class Course
{
    public Guid CourseId { get; set; }

    public string CourseCode { get; set; } = string.Empty;

    public string CourseName { get; set; } = string.Empty;

    public ChatRoom? ChatRoom { get; set; }

    public Guid? CreatedByAdminId { get; set; }

    public Guid? UpdatedByAdminId { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
