namespace Zumrah.Api.Models;

public class Student
{
    public Guid StudentId { get; set; }

    public Guid MicrosoftObjectId { get; set; }

    public string UniversityEmail { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public Guid MajorId { get; set; }

    public DateTime CreatedAt { get; set; }
}
