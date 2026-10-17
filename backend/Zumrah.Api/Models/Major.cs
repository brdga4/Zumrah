namespace Zumrah.Api.Models;

public class Major
{
    public Guid MajorId { get; set; }

    public Guid CollegeId { get; set; }

    public College College { get; set; } = null!;

    public string MajorName { get; set; } = string.Empty;

    public ChatRoom? ChatRoom { get; set; }

    public Guid? CreatedByAdminId { get; set; }

    public Guid? UpdatedByAdminId { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
