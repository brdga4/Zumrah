namespace Zumrah.Api.Models;

public class College
{
    public Guid CollegeId { get; set; }

    public string CollegeName { get; set; } = string.Empty;

    public Guid? CreatedByAdminId { get; set; }

    public Guid? UpdatedByAdminId { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
